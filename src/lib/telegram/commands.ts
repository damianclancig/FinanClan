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

import type { ParsedTransaction } from '@/types';
import { sendMessage, createConfirmationKeyboard, formatAmount } from './bot';
import { getInternalCategories as getCategories } from '@/app/actions/categoryActions';
import { getInternalPaymentMethods as getPaymentMethods } from '@/app/actions/paymentMethodActions';
import { getInternalTransactions as getTransactions } from '@/app/actions/transactions/transactionCrud';
import { getInternalCurrentBillingCycle as getCurrentBillingCycle } from '@/app/actions/billingCycleActions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Bot commands handler
 * Processes all bot commands like /start, /help, etc.
 */

export async function handleStartCommand(chatId: number, firstName?: string): Promise<void> {
  const welcomeMessage = `¡Hola${firstName ? ` ${firstName}` : ''}! 👋

Bienvenido a *FinanClan Bot*

Para usar este bot, necesitas vincular tu cuenta de FinanClan.

*¿Cómo vincular tu cuenta?*
1. Ve a caja.clancig.com.ar
2. Inicia sesión con tu cuenta
3. Ve a Configuración → Telegram
4. Genera un código de vinculación
5. Vuelve aquí y usa el comando:
   \`/vincular CODIGO\`

Una vez vinculada tu cuenta, podrás:
💸 Agregar gastos e ingresos con lenguaje natural
📊 Ver resúmenes de tus finanzas
🏷️ Consultar categorías y métodos de pago

Escribe /ayuda para ver todos los comandos disponibles.`;

  await sendMessage({
    chatId,
    text: welcomeMessage,
    parseMode: 'Markdown',
  });
}

export async function handleHelpCommand(chatId: number): Promise<void> {
  const helpMessage = `*Comandos disponibles:*

/start - Iniciar el bot
/vincular CODIGO - Vincular tu cuenta de FinanClan
/ayuda - Mostrar esta ayuda
/categorias - Ver categorías disponibles
/metodos - Ver métodos de pago
/resumen - Ver resumen del día/mes
/desvincular - Desvincular tu cuenta
/cancelar - Cancelar operación actual

*Agregar transacciones:*
Simplemente escribe en lenguaje natural:

Ejemplos:
• "Gasté 1500 en supermercado"
• "Compré ropa por 3000"
• "Ingreso de 50000 por salario"
• "500 de comida en mcdonalds"
• "Pagué 2000 de luz"

El bot entenderá tu mensaje y te pedirá confirmación antes de guardar la transacción.`;

  await sendMessage({
    chatId,
    text: helpMessage,
    parseMode: 'Markdown',
  });
}

export async function handleCategoriesCommand(
  chatId: number,
  userId: string
): Promise<void> {
  try {
    const categories = await getCategories(userId);

    if (categories.length === 0) {
      await sendMessage({
        chatId,
        text: 'No tienes categorías configuradas.',
      });
      return;
    }

    const enabledCategories = categories.filter(c => c.isEnabled);

    let message = '*Categorías disponibles:*\n\n';
    enabledCategories.forEach(category => {
      const icon = category.icon || '📌';
      message += `${icon} ${category.name}\n`;
    });

    await sendMessage({
      chatId,
      text: message,
      parseMode: 'Markdown',
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    await sendMessage({
      chatId,
      text: '❌ Error al obtener las categorías.',
    });
  }
}

export async function handlePaymentMethodsCommand(
  chatId: number,
  userId: string
): Promise<void> {
  try {
    const methods = await getPaymentMethods(userId);

    if (methods.length === 0) {
      await sendMessage({
        chatId,
        text: 'No tienes métodos de pago configurados.',
      });
      return;
    }

    const enabledMethods = methods.filter(m => m.isEnabled);

    let message = '*Métodos de pago disponibles:*\n\n';
    enabledMethods.forEach(method => {
      const typeEmoji = method.type === 'Cash' ? '💵' :
        method.type === 'Credit Card' ? '💳' :
          method.type === 'Debit Card' ? '💳' :
            method.type === 'Bank Transfer' ? '🏦' :
              method.type === 'VirtualWallet' ? '📱' : '💰';
      message += `${typeEmoji} ${method.name} (${method.type})\n`;
    });

    await sendMessage({
      chatId,
      text: message,
      parseMode: 'Markdown',
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    await sendMessage({
      chatId,
      text: '❌ Error al obtener los métodos de pago.',
    });
  }
}

export async function handleSummaryCommand(
  chatId: number,
  userId: string
): Promise<void> {
  try {
    const currentCycle = await getCurrentBillingCycle(userId);

    if (!currentCycle) {
      await sendMessage({
        chatId,
        text: 'No tienes un ciclo de facturación activo.',
      });
      return;
    }

    const transactions = await getTransactions(userId, { cycle: currentCycle });

    const today = new Date();
    const todayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === today.toDateString();
    });

    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const cycleIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const cycleExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const cycleBalance = cycleIncome - cycleExpenses;

    const cycleStart = format(new Date(currentCycle.startDate), 'dd/MM/yyyy', { locale: es });
    const cycleEnd = currentCycle.endDate
      ? format(new Date(currentCycle.endDate), 'dd/MM/yyyy', { locale: es })
      : 'Actual';

    let message = `📊 *Resumen Financiero*\n\n`;
    message += `*Hoy (${format(today, 'dd/MM/yyyy', { locale: es })}):*\n`;
    message += `💰 Ingresos: ${formatAmount(todayIncome)}\n`;
    message += `💸 Gastos: ${formatAmount(todayExpenses)}\n`;
    message += `📈 Balance: ${formatAmount(todayIncome - todayExpenses)}\n\n`;

    message += `*Ciclo actual (${cycleStart} - ${cycleEnd}):*\n`;
    message += `💰 Ingresos: ${formatAmount(cycleIncome)}\n`;
    message += `💸 Gastos: ${formatAmount(cycleExpenses)}\n`;
    message += `📈 Balance: ${formatAmount(cycleBalance)}\n`;

    await sendMessage({
      chatId,
      text: message,
      parseMode: 'Markdown',
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    await sendMessage({
      chatId,
      text: '❌ Error al obtener el resumen.',
    });
  }
}

export async function handleCancelCommand(chatId: number): Promise<void> {
  await sendMessage({
    chatId,
    text: '❌ Operación cancelada.',
  });
}

export async function showTransactionConfirmation(
  chatId: number,
  transaction: ParsedTransaction,
  confirmData: string
): Promise<void> {
  const typeEmoji = transaction.type === 'income' ? '💰' : '💸';
  const typeText = transaction.type === 'income' ? 'Ingreso' : 'Gasto';

  let message = `${typeEmoji} *${typeText}*\n\n`;
  message += `💵 Monto: ${formatAmount(transaction.amount)}\n`;
  message += `📝 Descripción: ${transaction.description}\n`;

  if (transaction.category) {
    message += `🏷️ Categoría: ${transaction.category}\n`;
  }

  if (transaction.paymentMethod) {
    message += `💳 Método de pago: ${transaction.paymentMethod}\n`;
  }

  const confidencePercent = Math.round(transaction.confidence * 100);
  if (transaction.confidence < 0.7) {
    message += `\n⚠️ Confianza: ${confidencePercent}% - Por favor verifica los datos\n`;
  }

  message += `\n¿Confirmas esta transacción?`;

  await sendMessage({
    chatId,
    text: message,
    parseMode: 'Markdown',
    replyMarkup: createConfirmationKeyboard(confirmData),
  });
}
