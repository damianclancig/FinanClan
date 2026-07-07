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

import type { ParsedTransaction, TransactionType } from '@/types';
import { parseDateExpression, formatDateForDisplay } from './dateParser';
import { toZonedTime } from 'date-fns-tz';

const transactionParserPrompt = `Eres un asistente experto en interpretar transacciones financieras en español argentino coloquial.

Tu tarea es extraer información de mensajes naturales sobre gastos e ingresos, siendo MUY FLEXIBLE con la forma en que el usuario escribe.

EXTRAE:
- type: "income" (ingreso) o "expense" (gasto)
- amount: monto numérico (acepta formatos como 2800, 2.800, $2800, etc)
- description: descripción breve y clara
- category: categoría sugerida (opcional)
- paymentMethod: método de pago (opcional)
- dateExpression: expresión de fecha si se menciona (opcional, ejemplos: "hoy", "ayer", "el lunes", "hace 3 días")
- confidence: 0 a 1 (qué tan seguro estás)

CATEGORÍAS DISPONIBLES:
- Salary: salario, sueldo, pago de trabajo
- Groceries: supermercado, verdulería, almacén, dietética, carnicería
- Food: comida, restaurant, delivery, café, fast food
- Clothing: ropa, zapatillas, indumentaria
- Other: todo lo demás (luz, agua, gas, nafta, etc)
- Taxes: impuestos
- Savings: ahorros

MÉTODOS DE PAGO:
- Cash: efectivo, plata, cash
- Credit Card: tarjeta de crédito, crédito, tarjeta lemon, naranja, visa, mastercard
- Debit Card: débito, tarjeta de débito
- Bank Transfer: transferencia
- VirtualWallet: billetera virtual, mercadopago, ualá, brubank
- Other: otro

EJEMPLOS DE MENSAJES QUE DEBES ENTENDER:
1. "gasté 2800 en yerba" → expense, 2800, "yerba", Groceries
2. "ayer gasté 2800 en yerba en dietética con tarjeta lemon" → expense, 2800, "yerba en dietética", Groceries, Credit Card, dateExpression: "ayer"
3. "compré ropa por 5000" → expense, 5000, "ropa", Clothing
4. "500 de comida" → expense, 500, "comida", Food
5. "ingreso de 50000 por salario" → income, 50000, "salario", Salary
6. "pagué 3000 de luz en efectivo" → expense, 3000, "luz", Other, Cash
7. "transferí 10000" → expense, 10000, "transferencia", Other, Bank Transfer
8. "gaste 1500 supermercado" → expense, 1500, "supermercado", Groceries
9. "800 nafta con débito" → expense, 800, "nafta", Other, Debit Card
10. "compre yerba 2800" → expense, 2800, "yerba", Groceries
11. "el lunes compré ropa por 5000" → expense, 5000, "ropa", Clothing, dateExpression: "el lunes"
12. "hace 3 días pagué 3000 de luz" → expense, 3000, "luz", Other, dateExpression: "hace 3 días"
13. "el día 20 gasté 1500 en supermercado" → expense, 1500, "supermercado", Groceries, dateExpression: "el día 20"
14. "anteayer compré 800 de nafta" → expense, 800, "nafta", Other, dateExpression: "anteayer"

REGLAS IMPORTANTES:
- SÉ MUY FLEXIBLE: acepta cualquier orden de palabras
- NO requieras estructura perfecta
- Palabras como "gasté", "compré", "pagué" indican EXPENSE
- Palabras como "ingreso", "cobré", "recibí" indican INCOME
- Si no mencionan tipo, asume EXPENSE (es lo más común)
- Extrae el número aunque esté en cualquier parte del mensaje
- La descripción puede ser una sola palabra o varias
- Si mencionan una marca de tarjeta (lemon, naranja, visa), es Credit Card
- Si dicen "efectivo" o "cash", es Cash
- Si dicen "débito", es Debit Card
- Si dicen "transferencia", es Bank Transfer
- Si dicen "mercadopago", "ualá", "brubank", es VirtualWallet
- Si mencionan "hoy", "ayer", "anteayer", día de la semana, o "hace X días", extrae como dateExpression
- Confidence alto (0.8-1.0) si está claro, medio (0.5-0.7) si falta info, bajo (<0.5) si muy ambiguo
- SIEMPRE responde con JSON válido, nunca con texto explicativo

FORMATO DE RESPUESTA (SOLO JSON, SIN MARKDOWN):
{
  "type": "expense",
  "amount": 2800,
  "description": "yerba en dietética",
  "category": "Groceries",
  "paymentMethod": "Credit Card",
  "dateExpression": "ayer",
  "confidence": 0.9
}`;

/**
 * Parse a natural language message into transaction data
 * @param message - The user's message
 * @param userCategories - User's actual categories from DB
 * @param userPaymentMethods - User's actual payment methods from DB
 */
export async function parseTransactionMessage(
  message: string,
  userCategories?: Array<{ name: string }>,
  userPaymentMethods?: Array<{ name: string; type: string }>,
  timezone?: string
): Promise<ParsedTransaction | null> {
  try {
    console.log('=== NLP PARSING START ===');
    console.log('Input message:', message);
    console.log('Available categories:', userCategories?.map(c => c.name).join(', '));
    console.log('Available payment methods:', userPaymentMethods?.map(m => m.name).join(', '));
    
    // Build dynamic prompt with user's actual options
    let dynamicPrompt = transactionParserPrompt;
    
    if (userCategories && userCategories.length > 0) {
      const categoryList = userCategories.map(c => `- ${c.name}`).join('\n');
      dynamicPrompt = dynamicPrompt.replace(
        'CATEGORÍAS DISPONIBLES:\n- Salary: salario, sueldo, pago de trabajo\n- Groceries: supermercado, verdulería, almacén, dietética, carnicería\n- Food: comida, restaurant, delivery, café, fast food\n- Clothing: ropa, zapatillas, indumentaria\n- Other: todo lo demás (luz, agua, gas, nafta, etc)\n- Taxes: impuestos\n- Savings: ahorros',
        `CATEGORÍAS DISPONIBLES DEL USUARIO (USA EXACTAMENTE ESTOS NOMBRES):\n${categoryList}\n\nIMPORTANTE: Debes usar EXACTAMENTE uno de estos nombres de categoría, no inventes otros.`
      );
    }
    
    if (userPaymentMethods && userPaymentMethods.length > 0) {
      const methodList = userPaymentMethods.map(m => `- ${m.name} (tipo: ${m.type})`).join('\n');
      dynamicPrompt = dynamicPrompt.replace(
        'MÉTODOS DE PAGO:\n- Cash: efectivo, plata, cash\n- Credit Card: tarjeta de crédito, crédito, tarjeta lemon, naranja, visa, mastercard\n- Debit Card: débito, tarjeta de débito\n- Bank Transfer: transferencia\n- VirtualWallet: billetera virtual, mercadopago, ualá, brubank\n- Other: otro',
        `MÉTODOS DE PAGO DISPONIBLES DEL USUARIO (USA EXACTAMENTE ESTOS NOMBRES):\n${methodList}\n\nIMPORTANTE: Debes usar EXACTAMENTE uno de estos nombres de método de pago, no inventes otros.`
      );
    }
    
    // Use Gemini to parse the message
    const prompt = `${dynamicPrompt}\n\nMensaje del usuario: "${message}"`;
    
    console.log('Calling Gemini API...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('Gemini raw response:', resultText);
    
    const responseText = resultText.trim();
    
    // Remove markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Cleaned JSON text:', jsonText);

    const parsed = JSON.parse(jsonText);
    console.log('Parsed object:', parsed);

    // Validate the parsed data
    if (!parsed.type || !parsed.amount || !parsed.description) {
      console.error('❌ Invalid parsed transaction - missing required fields:', parsed);
      console.error('Missing:', {
        type: !parsed.type,
        amount: !parsed.amount,
        description: !parsed.description,
      });
      return null;
    }

    // Ensure amount is positive
    const amount = Math.abs(Number(parsed.amount));
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid amount:', parsed.amount);
      return null;
    }

    // Validate type
    const validTypes: TransactionType[] = ['income', 'expense', 'deposit', 'withdrawal', 'transfer'];
    if (!validTypes.includes(parsed.type)) {
      console.error('❌ Invalid transaction type:', parsed.type);
      return null;
    }

    // Parse date expression if provided
    const tz = timezone || 'America/Argentina/Buenos_Aires';
    let transactionDate = new Date(); // Default to now
    
    if (parsed.dateExpression) {
      console.log('📅 Parsing date expression:', parsed.dateExpression);
      const parsedDate = parseDateExpression(parsed.dateExpression, undefined, tz);
      
      if (parsedDate) {
        transactionDate = parsedDate;
        console.log(`✅ Parsed date from "${parsed.dateExpression}":`, transactionDate.toLocaleDateString('es-AR'));
      } else {
        console.warn(`⚠️ Could not parse date expression: "${parsed.dateExpression}", using today`);
      }
    }

    const parsedTransaction = {
      type: parsed.type,
      amount,
      description: parsed.description,
      category: parsed.category,
      paymentMethod: parsed.paymentMethod,
      confidence: Number(parsed.confidence) || 0.5,
      date: transactionDate,
    };

    console.log('✅ Successfully parsed transaction:', parsedTransaction);
    console.log('=== NLP PARSING END ===');
    
    return parsedTransaction;
  } catch (error) {
    console.error('❌ ERROR parsing transaction message:');
    console.error('Error type:', error instanceof Error ? error.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    console.error('=== NLP PARSING FAILED ===');
    return null;
  }
}

/**
 * Format a parsed transaction for user confirmation
 */
export function formatTransactionForConfirmation(
  transaction: ParsedTransaction,
  showEditHint: boolean = true
): string {
  const typeEmoji = transaction.type === 'income' ? '💰' : '💸';
  const typeText = transaction.type === 'income' ? 'Ingreso' : 'Gasto';
  
  let message = `${typeEmoji} *${typeText}*\n\n`;
  message += `💵 Monto: $${transaction.amount.toLocaleString('es-AR')}\n`;
  message += `📝 Descripción: ${transaction.description}\n`;
  
  if (transaction.category) {
    const defaultIndicator = transaction.wasDefaultCategory ? ' ⚙️ _(por defecto)_' : '';
    message += `🏷️ Categoría: ${transaction.category}${defaultIndicator}\n`;
  }
  
  if (transaction.paymentMethod) {
    const defaultIndicator = transaction.wasDefaultPaymentMethod ? ' ⚙️ _(por defecto)_' : '';
    message += `💳 Método de pago: ${transaction.paymentMethod}${defaultIndicator}\n`;
  }
  
  // Add date display
  const dateText = formatDateForDisplay(transaction.date);
  message += `📅 Fecha: ${dateText}\n`;
  
  const confidencePercent = Math.round(transaction.confidence * 100);
  if (transaction.confidence < 0.7) {
    message += `\n⚠️ Confianza: ${confidencePercent}% - Por favor verifica los datos\n`;
  }
  
  message += `\n¿Confirmas esta transacción?`;
  
  if (showEditHint && (transaction.wasDefaultCategory || transaction.wasDefaultPaymentMethod)) {
    message += `\n\n💡 _Puedes editar escribiendo:_\n`;
    message += `_• "cambia la categoría por [nombre]"_\n`;
    message += `_• "usé [método de pago]"_`;
  }
  
  return message;
}

/**
 * Suggest category based on description keywords
 */
export function suggestCategory(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    'Groceries': ['supermercado', 'verdulería', 'carnicería', 'almacén', 'mercado'],
    'Food': ['comida', 'restaurant', 'delivery', 'pizza', 'burger', 'mcdonalds', 'café'],
    'Clothing': ['ropa', 'zapatillas', 'zapatos', 'remera', 'pantalón'],
    'Salary': ['salario', 'sueldo', 'pago'],
    'Taxes': ['impuesto', 'luz', 'agua', 'gas', 'internet', 'cable'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}
