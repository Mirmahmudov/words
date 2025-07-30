# 📘 My English Words - PWA

Inglizcha so'zlarni o'yin orqali yodlash uchun Progressive Web App (PWA).

## 🚀 Xususiyatlar

### 📱 PWA Funksiyalari
- **Offline ishlash** - Internet aloqasi bo'lmasa ham ishlaydi
- **Telefonga o'rnatish** - Oddiy dastur kabi o'rnatish mumkin
- **Push bildirishnomalar** - Eslatmalar va yangilanishlar
- **Tez yuklash** - Service Worker orqali kesh qilish
- **Responsive dizayn** - Barcha qurilmalarda yaxshi ko'rinadi

### 🎯 Asosiy Funksiyalar
- **So'z qo'shish** - Bitta yoki ko'p so'zlarni birdan qo'shish
- **Test rejimi** - 10 savollik ko'p tanlovli test
- **Mashq rejimi** - Tarjimani yozish orqali mashq qilish
- **Statistika** - O'rganish jarayonini kuzatish
- **So'zlar ro'yxati** - Barcha so'zlarni ko'rish va boshqarish

## 📁 Fayl Tuzilmasi

```
my-english-words/
├── index.html          # Asosiy HTML fayl
├── style.css           # CSS stillari
├── script.js           # JavaScript funksiyalari
├── manifest.json       # PWA manifest fayli
├── sw.js              # Service Worker
├── icons/             # PWA ikonlari
│   └── icon.svg       # Asosiy SVG ikon
└── README.md          # Bu fayl
```

## 🛠️ O'rnatish va Ishga Tushirish

### 1. Fayllarni yuklab oling
```bash
git clone [repository-url]
cd my-english-words
```

### 2. HTTP server orqali ishga tushiring
PWA faqat HTTPS yoki localhost orqali ishlaydi:

```bash
# Python bilan
python -m http.server 8000

# Node.js bilan
npx http-server

# PHP bilan
php -S localhost:8000
```

### 3. Brauzerda oching
```
http://localhost:8000
```

## 📱 PWA Sifatida O'rnatish

### Desktop (Chrome/Edge):
1. Saytni oching
2. Address bar'da "Install" tugmasini bosing
3. Yoki menyudan "Install My English Words" ni tanlang

### Mobile (Android/iOS):
1. Chrome/Safari'da saytni oching
2. "Add to Home Screen" tugmasini bosing
3. Dastur telefon ekraniga qo'shiladi

## 🌐 Deploy Qilish

### Netlify:
1. Fayllarni Netlify'ga upload qiling
2. Avtomatik HTTPS bilan deploy bo'ladi

### Vercel:
```bash
npm i -g vercel
vercel
```

### GitHub Pages:
1. Repository'ni GitHub'ga push qiling
2. Settings > Pages'da deploy qiling

## 💾 Ma'lumotlar Saqlash

- Barcha ma'lumotlar **localStorage**'da saqlanadi
- Backend server kerak emas
- Ma'lumotlar foydalanuvchi qurilmasida qoladi

## 🔧 Texnologiyalar

- **HTML5** - Markup
- **CSS3** - Styling va animatsiyalar
- **Vanilla JavaScript** - Funksiyalar
- **Service Worker** - Offline ishlash
- **Web App Manifest** - PWA konfiguratsiyasi
- **LocalStorage** - Ma'lumotlar saqlash

## 📊 Bulk Import Format

So'zlarni JSON formatida import qilish:

```json
[
  {"english": "apple", "uzbek": "olma"},
  {"english": "book", "uzbek": "kitob"},
  {"english": "water", "uzbek": "suv"}
]
```

## 🎮 Qanday Ishlatish

1. **So'z qo'shish**: Yangi so'zlarni qo'shing
2. **Test topshirish**: 10 savollik testni bajaring
3. **Mashq qilish**: Tarjimalarni yozing
4. **Statistikani ko'ring**: O'rganish jarayonini kuzating

## 🔄 Yangilanishlar

PWA avtomatik yangilanishlarni tekshiradi va foydalanuvchiga xabar beradi.

## 🤝 Hissa Qo'shish

1. Repository'ni fork qiling
2. O'zgarishlar kiriting
3. Pull request yuboring

## 📄 Litsenziya

MIT License - bepul foydalanish uchun.

## 🆘 Yordam

Muammolar yoki savollar bo'lsa, GitHub Issues'da yozing.

---

**Muvaffaqiyatli o'rganish! 🎉**