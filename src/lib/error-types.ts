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

/**
 * Standardized error response type for server actions.
 * 
 * All server actions should return this type when an error occurs,
 * ensuring consistent error handling across the application.
 * 
 * This file contains only types and type guards that can be safely
 * imported in both server and client components.
 */
export type ErrorResponse = { error: string };

/**
 * Type guard to check if a response is an error response.
 * 
 * Useful for discriminating between success and error responses
 * in server actions that can return either a result or an error.
 * 
 * @template T - The type of the success response
 * @param response - The response to check (can be success, error, null, or undefined)
 * @returns True if response is an ErrorResponse, false otherwise
 * 
 * @example
 * ```typescript
 * const result = await addCategory(data, userId);
 * 
 * if (isErrorResponse(result)) {
 *   // TypeScript knows result is { error: string }
 *   toast.error(result.error);
 *   return;
 * }
 * 
 * // TypeScript knows result is Category
 * toast.success(`Category ${result.name} created`);
 * ```
 */
export function isErrorResponse<T>(
  response: T | ErrorResponse | null | undefined
): response is ErrorResponse {
  return response != null && (response as ErrorResponse).error !== undefined;
}
