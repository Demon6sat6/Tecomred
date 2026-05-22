import { z } from "zod";

export const updateAltSchema = z.object({
  alt_text: z.string().max(255),
});

export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  created_at: string;
}
