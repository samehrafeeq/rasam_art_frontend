import { Link } from "@tanstack/react-router";
import { MapPin, Mail } from "lucide-react";

const branches = [
  { city: "جدة", addr: "طريق الملك عبد العزيز، الشاطئ" },
  { city: "الرياض", addr: "طريق الملك عبد العزيز، حي الغدير" },
  { city: "الرياض", addr: "شارع الأمير فيصل بن فهد، حطين" },
  { city: "حائل", addr: "طريق الملك فيصل" },
  { city: "أبها", addr: "طريق الملك فيصل، حي البلد" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-11 rounded-lg gradient-gold grid place-items-center font-display text-primary text-xl font-black">ر</div>
            <div>
              <div className="font-display font-extrabold">رسّام آرت</div>
              <div className="text-xs opacity-70">للاستشارات الهندسية</div>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            نصنع مساحات للمستقبل بتصاميم مبتكرة وإشراف هندسي معتمد عبر منصات أحكام وبلدي.
          </p>
        </div>

        <div>
          <h4 className="font-display text-gold mb-4">روابط سريعة</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/" className="hover:text-gold">الرئيسية</Link></li>
            <li><Link to="/services" className="hover:text-gold">خدماتنا</Link></li>
            <li><Link to="/about" className="hover:text-gold">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-gold">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-gold mb-4">فروعنا</h4>
          <ul className="space-y-2 text-sm opacity-90">
            {branches.slice(0, 4).map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <MapPin className="size-3.5 text-gold mt-1 shrink-0" />
                <span><strong>{b.city}:</strong> {b.addr}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-sm opacity-70 flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} مجموعة رسّام آرت للاستشارات الهندسية</span>
          <span className="flex items-center gap-2"><Mail className="size-3.5" /> info@rassam-art.sa</span>
        </div>
      </div>
    </footer>
  );
}
