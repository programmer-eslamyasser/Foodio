/* ملف الثوابت - يحتوي على إعدادات الحسابات الثابتة 
  Owner: Foodio Team
*/
'use strict';

window.AUTH_CONFIG = {
    // كلمات سر ثابتة للأدوار الإدارية
    STATIC_PASSWORDS: {
        ADMIN: "ADMIN_PASSWORD",
        RESTAURANT: "RESTAURANT_PASSWORD",
        DELIVERY: "DELIVERY_PASSWORD"
    },
    // روابط التوجيه بناءً على الدور
    REDIRECTS: {
        admin: "admin-dashboard.html",
        restaurant: "restaurant-dashboard.html",
        delivery: "delivery-dashboard.html",
        customer: "user-dashboard.html"
    }
};

