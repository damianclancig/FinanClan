"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "@/contexts/LanguageContext";
import { BackgroundWrapper } from "@/components/layout/BackgroundWrapper";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/layout/Footer";
import { GoogleIcon } from "@/components/common/GoogleIcon";

export default function HomePage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const { translations } = useTranslations();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    translations.landingFeature1,
    translations.landingFeature2,
    translations.landingFeature3,
    translations.landingFeature4,
    translations.landingFeature5,
    translations.landingFeature6,
  ];

  return (
    <BackgroundWrapper>
       <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-end p-4">
              <div className="flex items-center space-x-2">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
              </div>
          </header>
          <main className="grow flex items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl mb-8">
                    <div className="flex justify-center mb-6">
                      <Image 
                        src="/logo-big.webp" 
                        alt="FinanClan" 
                        width={400} 
                        height={120} 
                        priority
                        className="w-auto h-24 md:h-32 object-contain"
                        style={{ height: 'auto' }}
                      />
                    </div>
                    <p className="mt-4 text-xl md:text-2xl text-foreground font-semibold">
                      {translations.landingHeroTagline}
                    </p>
                </div>

                <Card className="w-full max-w-lg border-2 border-primary/50 shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-foreground">{translations.landingCardTitle}</h2>
                    <CardDescription className="text-base text-muted-foreground pt-1">
                      {translations.landingCardDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                      <ul className="space-y-3">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start text-base text-foreground">
                            <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    <Separator className="my-4" />
                    <p className="text-center text-muted-foreground text-base">
                      {translations.landingCtaPrompt}
                    </p>
                    <Button
                      onClick={signInWithGoogle}
                      className="w-full text-base py-6 bg-white/90 text-gray-800 hover:bg-white dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 border-2 border-transparent hover:border-accent transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      <GoogleIcon className="mr-3 h-6 w-6" />
                      {translations.signInWithGoogle}
                    </Button>
                  </CardContent>
                </Card>
            </div>
          </main>
          <Footer/>
        </div>
    </BackgroundWrapper>
  );
}
