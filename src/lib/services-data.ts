export interface BaseService {
  id: number;
  name: string;
  requirements: string;
  outputs: string;
  duration: string;
}

export const SERVICES_DATA: BaseService[] = [
  {
    id: 1,
    name: "إصدار رخصة بناء",
    requirements: "صك الملكية، قرار مساحي، رفع مساحي، مخططات هندسية، عقد إشراف",
    outputs: "رخصة بناء",
    duration: "3-10 أيام"
  },
  {
    id: 2,
    name: "إصدار شهادة امتثال",
    requirements: "شهادة إتمام البناء، مطابقة الاشتراطات",
    outputs: "شهادة امتثال",
    duration: "1-5 أيام"
  },
  {
    id: 3,
    name: "إصدار شهادة إتمام البناء",
    requirements: "رخصة البناء، تقارير الإشراف",
    outputs: "شهادة إتمام بناء",
    duration: "2-7 أيام"
  },
  {
    id: 4,
    name: "إضافة أو تعديل رخصة بناء",
    requirements: "الرخصة الحالية، مخططات التعديل",
    outputs: "رخصة معدلة",
    duration: "2-7 أيام"
  },
  {
    id: 5,
    name: "تجديد رخصة بناء",
    requirements: "الرخصة المنتهية، تقرير حالة المشروع",
    outputs: "رخصة مجددة",
    duration: "1-3 أيام"
  },
  {
    id: 6,
    name: "رخصة السكن الجماعي",
    requirements: "صك أو عقد إيجار، اشتراطات السلامة",
    outputs: "رخصة سكن جماعي",
    duration: "3-10 أيام"
  },
  {
    id: 7,
    name: "رخصة ترميم",
    requirements: "صك الملكية، تقرير هندسي",
    outputs: "رخصة ترميم",
    duration: "2-5 أيام"
  },
  {
    id: 8,
    name: "رخصة هدم",
    requirements: "صك الملكية، تقرير سلامة",
    outputs: "رخصة هدم",
    duration: "2-5 أيام"
  },
  {
    id: 9,
    name: "تصريح مظلة السيارات",
    requirements: "صك الملكية، تصميم المظلة",
    outputs: "تصريح مظلة",
    duration: "1-3 أيام"
  },
  {
    id: 10,
    name: "رخصة حفريات",
    requirements: "موافقات الجهات الخدمية، خطة السلامة",
    outputs: "رخصة حفريات",
    duration: "3-10 أيام"
  },
  {
    id: 11,
    name: "نقل ملكية الرخص",
    requirements: "صك محدث، بيانات المالك الجديد",
    outputs: "رخصة باسم المالك الجديد",
    duration: "1-3 أيام"
  },
  {
    id: 12,
    name: "تصحيح وضع مبنى قائم",
    requirements: "رفع مساحي، تقرير هندسي",
    outputs: "شهادة تصحيح وضع",
    duration: "5-15 يوماً"
  },
  {
    id: 13,
    name: "قرار مساحي",
    requirements: "صك الملكية، رفع مساحي",
    outputs: "قرار مساحي",
    duration: "2-7 أيام"
  },
  {
    id: 14,
    name: "الإشراف الهندسي",
    requirements: "عقد إشراف، رخصة بناء",
    outputs: "تقارير إشراف معتمدة",
    duration: "طوال المشروع"
  },
  {
    id: 15,
    name: "تحديث وتعديل الصكوك",
    requirements: "الصك الحالي، القرار المساحي",
    outputs: "صك محدث",
    duration: "حسب الجهة"
  },
  {
    id: 16,
    name: "الرفوعات المساحية",
    requirements: "صك الملكية، تحديد الموقع",
    outputs: "تقرير رفع مساحي",
    duration: "1-3 أيام"
  },
  {
    id: 17,
    name: "خدمات الدمج",
    requirements: "صكوك العقارات، قرار مساحي",
    outputs: "صك موحد",
    duration: "5-15 يوماً"
  },
  {
    id: 18,
    name: "خدمات التجزئة",
    requirements: "صك الملكية، مخطط التجزئة",
    outputs: "صكوك مستقلة",
    duration: "5-15 يوماً"
  },
  {
    id: 19,
    name: "فرز الوحدات العقارية",
    requirements: "شهادة إتمام بناء، مخططات فرز",
    outputs: "صكوك وحدات مستقلة",
    duration: "7-20 يوماً"
  }
];
