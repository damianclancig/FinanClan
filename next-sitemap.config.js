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

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://caja.clancig.com.ar',
    generateRobotsTxt: true, 
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
        ]
    },
    exclude: ['/add-transaction', '/edit-transaction/*', '/add-tax', '/edit-tax/*', '/settings/*', '/savings-funds/*', '/goodbye'],
};
