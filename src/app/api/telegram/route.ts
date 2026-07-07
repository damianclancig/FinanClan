/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { TelegramUpdate, ParsedTransaction } from '@/types';
import { verifyTelegramWebhook, sendMessage, answerCallbackQuery } from '@/lib/telegram/bot';
import {
  getTelegramUser,
  linkTelegramAccount,
  unlinkTelegramAccount
} from '@/lib/telegram/userMapping';
import { parseTransactionMessage } from '@/lib/telegram/nlp';
import { parseEditCommand, isLikelyEditCommand } from '@/lib/telegram/editParser';
import { parseDateExpression } from '@/lib/telegram/dateParser';
import {
  handleStartCommand,
  handleHelpCommand,
  handleCategoriesCommand,
  handlePaymentMethodsCommand,
  handleSummaryCommand,
  handleCancelCommand,
  showTransactionConfirmation,
} from '@/lib/telegram/commands';
import { addInternalTransaction as addTransaction } from '@/app/actions/transactions/transactionCrud';
import { getInternalCategories as getCategories } from '@/app/actions/categoryActions';
import { getInternalPaymentMethods as getPaymentMethods } from '@/app/actions/paymentMethodActions';
import { getDb } from '@/lib/actions-helpers';

/**
 * Telegram Bot Webhook
 * Receives and processes messages from Telegram
 */

// Conversation state for pending transactions
interface PendingTransactionState {
  transaction: ParsedTransaction;
  chatId: number;
  userId: string;
  messageId?: number;
  createdAt: number;
  lastEditedAt: number;
}

// Store pending transactions temporarily (in production, use Redis or database)
const pendingTransactions = new Map<string, PendingTransactionState>();

/**
 * Find best matching category by name or keywords
 */
function findMatchingCategory(suggestedCategory: string | undefined, categories: any[]) {
  if (!suggestedCategory) {
    return categories.find(c => c.name === 'Other' && c.isEnabled) || categories.find(c => c.isEnabled);
  }

  const normalized = suggestedCategory.toLowerCase();

  // Try exact match first (case insensitive)
  let match = categories.find(c =>
    c.name.toLowerCase() === normalized && c.isEnabled
  );
  if (match) return match;

  // Try if category name contains the suggestion
  match = categories.find(c =>
    c.name.toLowerCase().includes(normalized) && c.isEnabled
  );
  if (match) return match;

  // Try if suggestion contains the category name
  match = categories.find(c =>
    normalized.includes(c.name.toLowerCase()) && c.isEnabled
  );
  if (match) return match;

  // Try matching by keywords in category name
  const words = normalized.split(/\s+/);
  match = categories.find(c => {
    const categoryWords = c.name.toLowerCase().split(/\s+/);
    return words.some(w => categoryWords.includes(w)) && c.isEnabled;
  });
  if (match) return match;

  // Category mapping for common English names to Spanish or vice versa
  const categoryMap: Record<string, string[]> = {
    'Groceries': ['groceries', 'supermercado', 'almacen', 'verduleria', 'carniceria', 'dietética', 'dietetica'],
    'Food': ['food', 'comida', 'comidas', 'restaurant', 'delivery', 'cafe'],
    'Clothing': ['clothing', 'ropa', 'indumentaria', 'zapatillas'],
    'Salary': ['salary', 'salario', 'sueldo'],
    'Taxes': ['taxes', 'impuesto', 'impuestos', 'luz', 'agua', 'gas'],
    'Savings': ['savings', 'ahorros', 'ahorro'],
  };

  // Try to find by keyword mapping
  for (const [categoryName, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      // First try to find exact category name
      match = categories.find(c => c.name === categoryName && c.isEnabled);
      if (match) return match;

      // Then try to find by keyword in actual category names
      match = categories.find(c =>
        keywords.some(kw => c.name.toLowerCase().includes(kw)) && c.isEnabled
      );
      if (match) return match;
    }
  }

  // Fallback to Other or first enabled category
  return categories.find(c => c.name === 'Other' && c.isEnabled) || categories.find(c => c.isEnabled);
}

/**
 * Find best matching payment method by name or type
 */
function findMatchingPaymentMethod(suggestedMethod: string | undefined, methods: any[]) {
  if (!suggestedMethod) {
    return methods.find(m => m.type === 'Cash' && m.isEnabled) || methods.find(m => m.isEnabled);
  }

  const normalized = suggestedMethod.toLowerCase();

  // Try exact match by name first (case insensitive)
  let match = methods.find(m =>
    m.name.toLowerCase() === normalized && m.isEnabled
  );
  if (match) return match;

  // Try if method name contains the suggestion
  match = methods.find(m =>
    m.name.toLowerCase().includes(normalized) && m.isEnabled
  );
  if (match) return match;

  // Try if suggestion contains the method name
  match = methods.find(m =>
    normalized.includes(m.name.toLowerCase()) && m.isEnabled
  );
  if (match) return match;

  // Try matching by keywords in method name (for brands like "Lemon", "Naranja")
  const words = normalized.split(/\s+/);
  match = methods.find(m => {
    const methodWords = m.name.toLowerCase().split(/\s+/);
    return words.some(w => methodWords.includes(w) && w.length > 2) && m.isEnabled;
  });
  if (match) return match;

  // Payment method mapping for common variations
  const methodMap: Record<string, string[]> = {
    'Credit Card': ['credit', 'credito', 'crédito', 'tarjeta de credito', 'tarjeta de crédito', 'lemon', 'naranja', 'visa', 'mastercard', 'amex'],
    'Debit Card': ['debit', 'debito', 'débito', 'tarjeta de debito', 'tarjeta de débito'],
    'Cash': ['cash', 'efectivo', 'plata', 'billetes'],
    'Bank Transfer': ['transfer', 'transferencia', 'banco'],
    'VirtualWallet': ['virtual', 'wallet', 'billetera', 'mercadopago', 'ualá', 'uala', 'brubank', 'mp'],
  };

  // Try to find by keyword mapping
  for (const [methodType, keywords] of Object.entries(methodMap)) {
    if (keywords.some(kw => normalized.includes(kw) || kw.includes(normalized))) {
      // First try to find by keyword in actual method names (e.g., "Lemon Tarjeta" contains "lemon")
      match = methods.find(m =>
        keywords.some(kw => m.name.toLowerCase().includes(kw)) && m.isEnabled
      );
      if (match) return match;

      // Then try to find by type
      match = methods.find(m => m.type === methodType && m.isEnabled);
      if (match) return match;
    }
  }

  // Try exact match by type as last resort
  match = methods.find(m =>
    m.type.toLowerCase() === normalized && m.isEnabled
  );
  if (match) return match;

  // Fallback to Cash or first enabled method
  return methods.find(m => m.type === 'Cash' && m.isEnabled) || methods.find(m => m.isEnabled);
}


export async function POST(request: NextRequest) {
  try {
    // Verify the webhook is from Telegram
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (!secretToken || !verifyTelegramWebhook(secretToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();

    // Handle callback queries (button presses)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    // Handle text messages
    if (update.message?.text) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessage(message: TelegramUpdate['message']) {
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();
  const telegramId = message.from.id.toString();
  const username = message.from.username;
  const firstName = message.from.first_name;

  // Handle commands
  if (text.startsWith('/')) {
    await handleCommand(chatId, text, telegramId, username, firstName);
    return;
  }

  // Check if user is linked
  const telegramUser = await getTelegramUser(telegramId);
  if (!telegramUser) {
    await sendMessage({
      chatId,
      text: '⚠️ Primero debes vincular tu cuenta.\n\nUsa el comando /start para comenzar.',
    });
    return;
  }

  // Check if user has a pending transaction
  const pendingKey = `${chatId}_pending`;
  const pendingState = pendingTransactions.get(pendingKey);

  if (pendingState) {
    // User has a pending transaction, check if this is an edit command
    if (isLikelyEditCommand(text)) {
      await handleEditCommand(chatId, text, telegramUser.firebaseUid, pendingState);
      return;
    } else {
      // Not an edit command, inform user
      await sendMessage({
        chatId,
        text: '❓ Tienes una transacción pendiente. Puedes:\n\n• Editarla: "cambia la categoría por [nombre]" o "usé [método]"\n• Confirmarla: Presiona el botón ✅\n• Cancelarla: Presiona el botón ❌ o escribe /cancelar',
      });
      return;
    }
  }

  // No pending transaction, parse as new transaction
  await handleNaturalLanguageMessage(chatId, text, telegramUser.firebaseUid);
}

async function handleCommand(
  chatId: number,
  command: string,
  telegramId: string,
  username?: string,
  firstName?: string
) {
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case '/start':
      await handleStartCommand(chatId, firstName);
      break;

    case '/ayuda':
    case '/help':
      await handleHelpCommand(chatId);
      break;

    case '/vincular':
    case '/link':
      if (args.length === 0) {
        await sendMessage({
          chatId,
          text: '⚠️ Debes proporcionar el código de vinculación.\n\nEjemplo: /vincular 123456',
        });
        return;
      }
      await handleLinkCommand(chatId, args[0], telegramId, username, firstName);
      break;

    case '/desvincular':
    case '/unlink':
      await handleUnlinkCommand(chatId, telegramId);
      break;

    case '/categorias':
    case '/categories':
      const user1 = await getTelegramUser(telegramId);
      if (!user1) {
        await sendMessage({
          chatId,
          text: '⚠️ Primero debes vincular tu cuenta. Usa /start',
        });
        return;
      }
      await handleCategoriesCommand(chatId, user1.firebaseUid);
      break;

    case '/metodos':
    case '/methods':
      const user2 = await getTelegramUser(telegramId);
      if (!user2) {
        await sendMessage({
          chatId,
          text: '⚠️ Primero debes vincular tu cuenta. Usa /start',
        });
        return;
      }
      await handlePaymentMethodsCommand(chatId, user2.firebaseUid);
      break;

    case '/resumen':
    case '/summary':
      const user3 = await getTelegramUser(telegramId);
      if (!user3) {
        await sendMessage({
          chatId,
          text: '⚠️ Primero debes vincular tu cuenta. Usa /start',
        });
        return;
      }
      await handleSummaryCommand(chatId, user3.firebaseUid);
      break;

    case '/cancelar':
    case '/cancel':
      await handleCancelCommand(chatId);
      break;

    default:
      await sendMessage({
        chatId,
        text: '❓ Comando no reconocido. Usa /ayuda para ver los comandos disponibles.',
      });
  }
}

async function handleLinkCommand(
  chatId: number,
  code: string,
  telegramId: string,
  username?: string,
  firstName?: string
) {
  const result = await linkTelegramAccount(code, telegramId, username, firstName);

  if (result.success) {
    await sendMessage({
      chatId,
      text: '✅ ¡Cuenta vinculada exitosamente!\n\nYa puedes empezar a agregar transacciones escribiendo en lenguaje natural.\n\nEjemplo: "Gasté 500 en comida"',
    });
  } else {
    await sendMessage({
      chatId,
      text: `❌ ${result.error || 'Error al vincular la cuenta'}`,
    });
  }
}

async function handleUnlinkCommand(chatId: number, telegramId: string) {
  const result = await unlinkTelegramAccount(telegramId);

  if (result.success) {
    await sendMessage({
      chatId,
      text: '✅ Cuenta desvinculada exitosamente.',
    });
  } else {
    await sendMessage({
      chatId,
      text: `❌ ${result.error || 'Error al desvincular la cuenta'}`,
    });
  }
}

async function handleNaturalLanguageMessage(
  chatId: number,
  text: string,
  userId: string
) {
  // Show typing indicator
  await sendMessage({
    chatId,
    text: '🤔 Procesando...',
  });

  // Get user's categories, payment methods, and timezone
  const { usersCollection } = await getDb();
  const [categories, methods, userDoc] = await Promise.all([
    getCategories(userId),
    getPaymentMethods(userId),
    usersCollection.findOne({ _id: userId as any }),
  ]);

  const timezone = userDoc?.timezone || 'America/Argentina/Buenos_Aires';
  const enabledCategories = categories.filter(c => c.isEnabled);
  const enabledMethods = methods.filter(m => m.isEnabled);

  // Parse with user's actual data and timezone
  const parsed = await parseTransactionMessage(text, enabledCategories, enabledMethods, timezone);

  if (!parsed || parsed.confidence < 0.3) {
    await sendMessage({
      chatId,
      text: '❓ No pude entender tu mensaje.\n\nIntenta ser más específico, por ejemplo:\n• "Gasté 500 en comida"\n• "Ingreso de 10000 por salario"\n\nUsa /ayuda para ver más ejemplos.',
    });
    return;
  }

  // If no category was detected, use fallback
  let wasDefaultCategory = false;
  if (!parsed.category) {
    const otherCategory = enabledCategories.find(c => c.name === 'Other' || c.name === 'Otros' || c.name === 'Varios');
    if (otherCategory) {
      parsed.category = otherCategory.name;
      wasDefaultCategory = true;
    } else if (enabledCategories.length > 0) {
      parsed.category = enabledCategories[0].name;
      wasDefaultCategory = true;
    }
  }

  // If no payment method, use fallback
  let wasDefaultPaymentMethod = false;
  if (!parsed.paymentMethod) {
    const cashMethod = enabledMethods.find(m =>
      m.type === 'Cash' ||
      m.name.toLowerCase().includes('efectivo') ||
      m.name.toLowerCase().includes('cash')
    );
    if (cashMethod) {
      parsed.paymentMethod = cashMethod.name;
      wasDefaultPaymentMethod = true;
    } else if (enabledMethods.length > 0) {
      parsed.paymentMethod = enabledMethods[0].name;
      wasDefaultPaymentMethod = true;
    }
  }

  // Add default flags to transaction
  parsed.wasDefaultCategory = wasDefaultCategory;
  parsed.wasDefaultPaymentMethod = wasDefaultPaymentMethod;

  // Store the pending transaction with state
  const pendingKey = `${chatId}_pending`;
  const now = Date.now();
  pendingTransactions.set(pendingKey, {
    transaction: parsed,
    chatId,
    userId,
    createdAt: now,
    lastEditedAt: now,
  });

  // Show confirmation
  await showTransactionConfirmation(chatId, parsed, `confirm_${pendingKey}`);
}

/**
 * Handle edit commands for pending transactions
 */
async function handleEditCommand(
  chatId: number,
  text: string,
  userId: string,
  pendingState: PendingTransactionState
) {
  // Parse the edit command
  const editCommand = parseEditCommand(text);

  if (!editCommand || editCommand.type === 'none') {
    // Not a valid edit command
    await sendMessage({
      chatId,
      text: '❓ No entendí el cambio. Intenta:\n\n• "cambia la categoría por [nombre]"\n• "usé [método de pago]"\n• "eran [monto]"\n• "cambia la descripción por [texto]"\n• "cambia la fecha a [expresión]"',
    });
    return;
  }

  // Get user's categories and payment methods for matching
  const [categories, methods] = await Promise.all([
    getCategories(userId),
    getPaymentMethods(userId),
  ]);

  // Apply the edit
  const updated = { ...pendingState.transaction };
  let editApplied = false;
  let editMessage = '';

  switch (editCommand.type) {
    case 'category':
      const category = findMatchingCategory(editCommand.value, categories);
      if (category) {
        updated.category = category.name;
        updated.wasDefaultCategory = false;
        editApplied = true;
        editMessage = `Categoría cambiada a: ${category.name}`;
      } else {
        await sendMessage({
          chatId,
          text: `❌ No encontré la categoría "${editCommand.value}". Usa /categorias para ver las disponibles.`,
        });
        return;
      }
      break;

    case 'paymentMethod':
      const method = findMatchingPaymentMethod(editCommand.value, methods);
      if (method) {
        updated.paymentMethod = method.name;
        updated.wasDefaultPaymentMethod = false;
        editApplied = true;
        editMessage = `Método de pago cambiado a: ${method.name}`;
      } else {
        await sendMessage({
          chatId,
          text: `❌ No encontré el método de pago "${editCommand.value}". Usa /metodos para ver los disponibles.`,
        });
        return;
      }
      break;

    case 'amount':
      const newAmount = parseFloat(editCommand.value);
      if (!isNaN(newAmount) && newAmount > 0) {
        updated.amount = newAmount;
        editApplied = true;
        editMessage = `Monto cambiado a: $${newAmount.toLocaleString('es-AR')}`;
      } else {
        await sendMessage({
          chatId,
          text: '❌ Monto inválido. Debe ser un número positivo.',
        });
        return;
      }
      break;

    case 'description':
      if (editCommand.value.trim()) {
        updated.description = editCommand.value.trim();
        editApplied = true;
        editMessage = `Descripción cambiada a: ${updated.description}`;
      } else {
        await sendMessage({
          chatId,
          text: '❌ La descripción no puede estar vacía.',
        });
        return;
      }
      break;

    case 'date':
      const parsedDate = parseDateExpression(editCommand.value);
      if (parsedDate) {
        updated.date = parsedDate;
        editApplied = true;
        const dateText = parsedDate.toLocaleDateString('es-AR');
        editMessage = `Fecha cambiada a: ${dateText}`;
      } else {
        await sendMessage({
          chatId,
          text: `❌ No pude entender la fecha "${editCommand.value}". Intenta con "hoy", "ayer", "el lunes", etc.`,
        });
        return;
      }
      break;
  }

  if (editApplied) {
    // Update pending state
    pendingState.transaction = updated;
    pendingState.lastEditedAt = Date.now();
    const pendingKey = `${chatId}_pending`;
    pendingTransactions.set(pendingKey, pendingState);

    // Show updated confirmation
    await sendMessage({
      chatId,
      text: `✅ ${editMessage}\n\n` + await import('@/lib/telegram/nlp').then(m => m.formatTransactionForConfirmation(updated)),
      parseMode: 'Markdown',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '✅ Confirmar', callback_data: `confirm_${pendingKey}` },
            { text: '❌ Cancelar', callback_data: 'cancel' }
          ]
        ]
      }
    });
  }
}

async function handleCallbackQuery(callbackQuery: TelegramUpdate['callback_query']) {
  if (!callbackQuery || !callbackQuery.data) return;

  const chatId = callbackQuery.message?.chat.id;
  if (!chatId) return;

  const telegramId = callbackQuery.from.id.toString();
  const data = callbackQuery.data;

  // Answer the callback query
  await answerCallbackQuery(callbackQuery.id);

  if (data === 'cancel') {
    // Clear pending transaction
    const pendingKey = `${chatId}_pending`;
    pendingTransactions.delete(pendingKey);

    await sendMessage({
      chatId,
      text: '❌ Transacción cancelada.',
    });
    return;
  }

  if (data.startsWith('confirm_')) {
    const pendingKey = data.replace('confirm_', '');
    const pendingState = pendingTransactions.get(pendingKey);

    if (!pendingState) {
      await sendMessage({
        chatId,
        text: '❌ Transacción expirada. Por favor intenta nuevamente.',
      });
      return;
    }

    const transaction = pendingState.transaction;

    // Get user
    const telegramUser = await getTelegramUser(telegramId);
    if (!telegramUser) {
      await sendMessage({
        chatId,
        text: '❌ Error: Usuario no vinculado.',
      });
      return;
    }

    // Get category ID with smart matching
    const categories = await getCategories(telegramUser.firebaseUid);
    const category = findMatchingCategory(transaction.category, categories);

    if (!category) {
      await sendMessage({
        chatId,
        text: '❌ Error: No se encontró ninguna categoría habilitada.',
      });
      return;
    }

    // Get payment method ID with smart matching
    const methods = await getPaymentMethods(telegramUser.firebaseUid);
    const paymentMethod = findMatchingPaymentMethod(transaction.paymentMethod, methods);

    if (!paymentMethod) {
      await sendMessage({
        chatId,
        text: '❌ Error: No se encontró ningún método de pago habilitado.',
      });
      return;
    }

    // Create transaction
    const result = await addTransaction(
      {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        categoryId: category.id,
        paymentMethodId: paymentMethod.id,
        date: transaction.date || new Date(),
      },
      telegramUser.firebaseUid
    );

    if ('error' in result) {
      await sendMessage({
        chatId,
        text: `❌ Error al guardar la transacción: ${result.error}`,
      });
    } else {
      const typeEmoji = transaction.type === 'income' ? '💰' : '💸';
      await sendMessage({
        chatId,
        text: `${typeEmoji} ¡Transacción guardada exitosamente!\n\n💵 $${transaction.amount.toLocaleString('es-AR')}\n📝 ${transaction.description}`,
      });
    }

    // Clean up
    pendingTransactions.delete(pendingKey);
  }
}
