import { z } from "zod";

const text = z.string().max(10000);
const shortText = z.string().max(500);

// Solo contenido público. Nunca aceptar ni publicar credenciales del panel.
export const settingsSchema = z
  .object({
    storeName: shortText,
    storeEmail: shortText,
    storePhone: shortText,
    storeAddress: shortText,
    supportHours: shortText,
    storeWebsite: shortText,
    freeShippingMin: shortText,
    currency: shortText,
    taxRate: shortText,
    maintenanceMode: z.boolean(),
    showOutOfStock: z.boolean(),
    allowReviews: z.boolean(),
    gaId: shortText,
    brands: z
      .array(z.object({ name: shortText, colorClass: shortText }))
      .max(200),
    categories: z.array(shortText).max(200),
    aboutMission: text,
    aboutVision: text,
    aboutTeam: z
      .array(z.object({ name: shortText, role: shortText, image: text }))
      .max(100),
    stat1Value: shortText,
    stat1Suffix: shortText,
    stat1Label: shortText,
    stat2Value: shortText,
    stat2Suffix: shortText,
    stat2Label: shortText,
    stat3Value: shortText,
    stat3Suffix: shortText,
    stat3Label: shortText,
    stat4Value: shortText,
    stat4Suffix: shortText,
    stat4Label: shortText,
  })
  .partial();
