import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import LocationMap from "@/components/LocationMap";

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          pageOrigin: window.location.href,
        },
      });

      if (error) throw error;

      toast.success(t.contact.form.success || "Merci, votre message a été envoyé avec succès.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(t.contact.form.error || "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-14 lg:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.contact.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[.9fr_1.2fr_1fr] gap-5 lg:gap-6 max-w-7xl mx-auto items-stretch">
          {/* Contact Info */}
          <div className="flex min-w-0 flex-col gap-4 h-full">
            <Card className="bg-card border-border flex-1 min-h-[96px]">
              <CardContent className="p-5 sm:p-6 h-full flex items-center">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{t.contact.address.title}</h3>
                    <p className="text-muted-foreground">
                      {t.contact.address.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border flex-1 min-h-[96px]">
              <CardContent className="p-5 sm:p-6 h-full flex items-center">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{t.contact.email.title}</h3>
                    <a href="mailto:contact@agricapital.ci" className="text-muted-foreground hover:text-primary transition-smooth break-words">
                      {t.contact.email.value}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border flex-1 min-h-[96px]">
              <CardContent className="p-5 sm:p-6 h-full flex items-center">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{t.contact.phone.title}</h3>
                    <a href="tel:+2250564551717" className="text-muted-foreground hover:text-primary transition-smooth break-words">
                      +225 05 64 55 17 17
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-agri-green/10 border-agri-green flex-1 min-h-[96px]">
              <CardContent className="p-5 sm:p-6 h-full flex items-center">
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-6 h-6 text-agri-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">WhatsApp</h3>
                    <a 
                      href="https://wa.me/2250564551717" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-agri-green transition-smooth"
                    >
                      +225 05 64 55 17 17
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-agri-orange/10 border-agri-orange flex-1 min-h-[96px]">
              <CardContent className="p-5 sm:p-6 h-full flex items-center">
                <div>
                  <h3 className="font-bold text-foreground mb-2">RCCM</h3>
                  <p className="text-sm text-muted-foreground mb-1">CI-DAL-01-2025-B12-13435</p>
                  <p className="text-sm text-muted-foreground">Fondée en 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="min-w-0 h-full">
            <Card className="bg-card border-border h-full flex flex-col">
              <CardContent className="p-5 sm:p-7 flex-1">
                <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.contact.form.name} {t.contact.form.required}
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t.contact.form.name}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.contact.form.email} {t.contact.form.required}
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t.contact.form.email}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.contact.form.subject} {t.contact.form.required}
                    </label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t.contact.form.subject}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.contact.form.message} {t.contact.form.required}
                    </label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.contact.form.message}
                      className="bg-background min-h-[150px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-accent text-accent-foreground border-0 hover:opacity-90 transition-smooth disabled:opacity-50"
                    size="lg"
                  >
                    {isSubmitting ? (t.contact.form.sending || "Envoi...") : t.contact.form.submit}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0 md:col-span-2 lg:col-span-1 h-full">
            <LocationMap className="h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
