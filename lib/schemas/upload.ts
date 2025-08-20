import { z } from 'zod';

export const fileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine((file) => [
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword', 
      'text/plain'
    ].includes(file.type), {
      message: 'File uploaded but current model (Groq Llama) doesn\'t support file processing. Supported formats: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT',
    }),
});

export type FileUpload = z.infer<typeof fileSchema>;
