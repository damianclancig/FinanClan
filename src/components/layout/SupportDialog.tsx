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


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Briefcase, ClipboardCopy, Check } from "lucide-react";
import { useTranslations } from "@/contexts/LanguageContext";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path fill="#ffffff" d="M7.017 21.933H3.122a.64.64 0 0 1-.631-.74L5.35 2.45a.64.64 0 0 1 .631-.54h7.384c2.287 0 4.07.493 5.103 1.6.84.883 1.12 2.046.847 3.604-.64 3.582-2.853 5.174-5.677 5.174h-2.81c-.365 0-.676.267-.732.629l-1.08 6.916c-.056.36-.367.63-.732.63Z"/>
    <path fill="#009cde" d="M19.986 6.41c-.048.269-.107.527-.177.777-.646 3.583-2.853 5.174-5.677 5.174h-2.81c-.364 0-.676.267-.732.63l-1.08 6.916c-.056.36-.367.629-.732.629H5.85l.314-1.98 1.002-6.426.063-.395a.64.64 0 0 1 .631-.54h3.972c2.287 0 4.07-.493 5.103-1.6a4.77 4.77 0 0 0 1.051-2.185c.048-.268.082-.541.099-.816a4.63 4.63 0 0 0-.102-1.214Z"/>
  </svg>
  );
  
export function SupportDialog() {
  const { translations } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://caja.clancig.com.ar';
  const CAFECITO_USER = process.env.NEXT_PUBLIC_CAFECITO_USER;
  const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL;
  const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL;
  const PAYPAL_URL = process.env.NEXT_PUBLIC_PAYPAL_URL;
  const MERCADOPAGO_URL = process.env.NEXT_PUBLIC_MERCADOPAGO_URL;

  if (!CAFECITO_USER || !PORTFOLIO_URL || !GITHUB_REPO_URL || !PAYPAL_URL || !MERCADOPAGO_URL) {
    console.warn("Support Dialog: One or more environment variables for support links are not set.");
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="relative group"
          aria-label={translations.supportProject}
        >
          <Heart className="h-8 w-8 text-red-500 fill-red-500 animate-[pulse-subtle_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">{translations.supportProject}</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base pt-2 text-foreground/80">
            {translations.supportMessage1}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 sm:py-4 text-sm sm:text-base space-y-2 sm:space-y-4 text-center">
            <p>{translations.supportMessage2}</p>
            <p>{translations.supportMessage3}</p>
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 sm:gap-3">
          <Button variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg" onClick={handleCopyLink}>
            <div className="flex items-center justify-center w-full">
              <div className="w-10 mr-2 flex justify-center">
                {isCopied ? <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" /> : <ClipboardCopy className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              <span className="text-left">{isCopied ? translations.copied : translations.supportCopyLink}</span>
            </div>
          </Button>
          <Button asChild className="w-full text-base h-auto py-2 sm:py-3" size="lg">
            <a href={`https://cafecito.app/${CAFECITO_USER}`} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center w-full">
                <div className="w-10 mr-2 flex justify-center text-xl sm:text-2xl">☕</div>
                <span className="text-left">{translations.supportCafecito}</span>
              </div>
            </a>
          </Button>
          {MERCADOPAGO_URL && (
            <Button asChild className="w-full text-base bg-[#009EE3] hover:bg-[#0087c1] h-[56px] py-0 px-2" size="lg">
              <a href={MERCADOPAGO_URL} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-24 sm:w-28 -ml-4 sm:-ml-5 mr-1 flex justify-center">
                    <img 
                      src="/mp.svg" 
                      alt="Mercado Pago" 
                      className="w-full h-auto min-w-[96px] sm:min-w-[132px]" 
                      style={{ height: "auto" }}
                    />
                  </div>
                  <span className="text-left">{translations.supportMercadoPago}</span>
                </div>
              </a>
            </Button>
          )}
           {PAYPAL_URL && (
            <Button asChild className="w-full text-base bg-[#003087] hover:bg-[#00205b] h-auto py-2 sm:py-3" size="lg">
              <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-10 mr-2 flex justify-center">
                      <PayPalIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-left">{translations.supportPaypal}</span>
                </div>
              </a>
            </Button>
          )}
          <Button asChild variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg">
            <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center w-full">
                <div className="w-10 mr-2 flex justify-center">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-left">{translations.supportVisitPortfolio}</span>
              </div>
            </a>
          </Button>
          <Button asChild variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center w-full">
                <div className="w-10 mr-2 flex justify-center">
                  <GithubIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-left">{translations.supportGithub}</span>
              </div>
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
