import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Download, Mail, Phone, Calendar, Search, User } from "lucide-react";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      setMessages(res.data);
    } catch (err: any) {
      toast.error("حدث خطأ أثناء تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (messages.length === 0) {
      toast.error("لا توجد رسائل لتصديرها");
      return;
    }

    const dataToExport = messages.map(msg => ({
      "المعرف": msg.id,
      "اسم المرسل": msg.name,
      "البريد الإلكتروني": msg.email,
      "رقم الجوال": msg.phone,
      "نص الرسالة": msg.message,
      "تاريخ الإرسال": new Date(msg.createdAt).toLocaleString('ar-SA')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Set right-to-left for the worksheet
    if(!worksheet['!cols']) worksheet['!cols'] = [];
    worksheet['!cols'][0] = { wch: 10 };
    worksheet['!cols'][1] = { wch: 30 };
    worksheet['!cols'][2] = { wch: 35 };
    worksheet['!cols'][3] = { wch: 20 };
    worksheet['!cols'][4] = { wch: 80 };
    worksheet['!cols'][5] = { wch: 25 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الرسائل");
    
    // Enable RTL for the workbook views
    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [];
    workbook.Workbook.Views.push({ RTL: true });

    XLSX.writeFile(workbook, `رسائل_العملاء_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.includes(searchTerm) || 
    msg.email.includes(searchTerm) || 
    msg.phone.includes(searchTerm) || 
    msg.message.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-foreground">رسائل العملاء</h1>
          <p className="text-sm text-muted-foreground mt-2">إدارة واستعراض الرسائل الواردة من صفحة تواصل معنا.</p>
        </div>
        <button onClick={downloadExcel} className="btn-primary shrink-0 w-full md:w-auto shadow-md shadow-gold/20">
          <Download className="size-4" /> تصدير ملف Excel
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في الرسائل بالاسم، الإيميل، رقم الجوال..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition-all shadow-sm"
            />
          </div>
          <div className="text-sm px-3 py-1.5 bg-secondary rounded-lg text-muted-foreground font-semibold shrink-0">
            {filteredMessages.length} رسالة مطابقة
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <Loader2 className="size-8 text-gold animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            <div className="size-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="size-10 opacity-40 text-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground">لا توجد رسائل</p>
            <p className="text-sm mt-2">لم يقم أحد بإرسال رسائل تطابق بحثك حالياً.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredMessages.map((msg, idx) => (
              <div key={msg.id} className="p-5 md:p-6 hover:bg-secondary/20 transition-colors group">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                  
                  {/* Sender Info */}
                  <div className="lg:w-1/3 shrink-0 flex gap-4">
                    <div className="size-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-gold border border-gold/20 shrink-0 shadow-sm">
                      <User className="size-6" />
                    </div>
                    <div className="space-y-2 overflow-hidden">
                      <div className="font-bold text-lg text-foreground truncate" title={msg.name}>
                        {msg.name}
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 truncate" dir="ltr" title={msg.phone}>
                          <Phone className="size-3.5 shrink-0" /> <span className="truncate">{msg.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 truncate" dir="ltr" title={msg.email}>
                          <Mail className="size-3.5 shrink-0" /> <span className="truncate">{msg.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="lg:w-1/2 flex-1">
                    <div className="bg-secondary/40 p-4 rounded-xl border border-border/50 text-foreground text-sm leading-relaxed whitespace-pre-wrap shadow-inner relative">
                      {msg.message}
                    </div>
                  </div>

                  {/* Metadata / Actions */}
                  <div className="lg:w-1/6 shrink-0 flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2">
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/80 bg-secondary px-2 py-1 rounded-md">
                        <Calendar className="size-3.5" />
                        {new Date(msg.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="mt-1.5 opacity-70 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gold/50 lg:mt-auto">
                      # {messages.length - idx}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
