import { z } from "zod";

export const reservationSchema = z
  .object({
    facility: z.string().min(1, "Musíte vybrať zariadenie"),
    startTime: z
      .string()
      .min(1, "Čas začiatku je povinný")
      .refine((startTime) => new Date(startTime) >= new Date(), {
        message: "Čas začiatku nemôže byť v minulosti",
        path: ["startTime"],
      }),
      endTime: z
      .string()
      .min(1, "Čas konca je povinný")
      .refine((endTime, ctx) => new Date(endTime) >= new Date(), {
        message: "Čas konca nemôže byť v minulosti",
        path: ["endTime"],
      }),
  })
  .refine(
    (data) => new Date(data.startTime) < new Date(data.endTime),
    {
      message: "Čas začiatku musí byť menší ako čas konca",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      const startDate = new Date(data.startTime);
      const endDate = new Date(data.endTime);
      return startDate.toDateString() === endDate.toDateString(); // Overí, že oba časy sú v rovnaký deň
    },
    {
      message: "Čas začiatku a konca musia byť v rovnaký deň",
      path: ["endTime"],
    }
  );

  export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Meno musí mať aspoň 2 znaky")
      .max(50, "Meno je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Meno musí začínať veľkým písmenom",
      }),
    lastName: z
      .string()
      .min(2, "Priezvisko musí mať aspoň 2 znaky")
      .max(50, "Priezvisko je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Priezvisko musí začínať veľkým písmenom",
      }),
    email: z.string().email("Neplatný email"),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Telefónne číslo musí obsahovať presne 10 číslic"),
    password: z
      .string()
      .min(5, "Heslo musí mať aspoň 5 znakov"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Heslá sa musia zhodovať",
    path: ["confirmPassword"],
  });

  export const loginSchema = z
  .object({
    email: z.string().email("Neplatný email"),
    password: z.string().min(5, "Heslo musí mať aspoň 5 znakov"),
  })

  export const profileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Meno musí mať aspoň 2 znaky")
      .max(50, "Meno je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Meno musí začínať veľkým písmenom",
      }),
    lastName: z
      .string()
      .min(2, "Priezvisko musí mať aspoň 2 znaky")
      .max(50, "Priezvisko je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Priezvisko musí začínať veľkým písmenom",
      }),
    email: z.string().email("Neplatný email"),
    phone: z.string().regex(/^\d{10}$/, "Telefónne číslo musí obsahovať presne 10 číslic"),
  });

  export const passwordSchema = z
  .object({
    newPassword: z.string().min(5, "Heslo musí mať aspoň 5 znakov"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Heslá sa musia zhodovať",
    path: ["confirmPassword"],
  });

  export const facilitySchema = z
  .object({
    name: z.string().min(2, "Názov zariadenia musí mať aspoň 2 znaky."),
    inService: z.boolean(),
  });

  export const reservationManageSchema = z
  .object({
    startTime: z
      .string()
      .min(1, "Čas začiatku je povinný")
      .refine((startTime) => new Date(startTime) >= new Date(), {
        message: "Čas začiatku nemôže byť v minulosti",
        path: ["startTime"],
      }),
      endTime: z
      .string()
      .min(1, "Čas konca je povinný")
      .refine((endTime, ctx) => new Date(endTime) >= new Date(), {
        message: "Čas konca nemôže byť v minulosti",
        path: ["endTime"],
      }),
  })
  .refine(
    (data) => new Date(data.startTime) < new Date(data.endTime),
    {
      message: "Čas začiatku musí byť menší ako čas konca",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      const startDate = new Date(data.startTime);
      const endDate = new Date(data.endTime);
      return startDate.toDateString() === endDate.toDateString(); // Overí, že oba časy sú v rovnaký deň
    },
    {
      message: "Čas začiatku a konca musia byť v rovnaký deň",
      path: ["endTime"],
    }
  );

  export const userSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Meno musí mať aspoň 2 znaky")
      .max(50, "Meno je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Meno musí začínať veľkým písmenom",
      }),
    lastName: z
      .string()
      .min(2, "Priezvisko musí mať aspoň 2 znaky")
      .max(50, "Priezvisko je príliš dlhé")
      .refine((name) => /^[A-Z]/.test(name), {
        message: "Priezvisko musí začínať veľkým písmenom",
      }),
    email: z.string().email("Neplatný email"),
    phone: z.string().regex(/^\d{10}$/, "Telefónne číslo musí obsahovať presne 10 číslic"),
    password: z.string().min(5, "Heslo musí mať aspoň 5 znakov.").optional(),
    role: z.enum(["admin", "user"], {
      message: "Rola musí byť buď 'admin', alebo 'user'.",
    }),
  });