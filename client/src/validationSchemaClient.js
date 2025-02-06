import { z } from "zod";

export const reservationSchema = z
  .object({
    facility: z.string().nonempty("Musíte vybrať zariadenie"),
    startTime: z
      .string()
      .nonempty("Čas začiatku je povinný")
      .refine((startTime) => new Date(startTime) >= new Date(), {
        message: "Čas začiatku nemôže byť v minulosti",
        path: ["startTime"],
      }),
      endTime: z
      .string()
      .nonempty("Čas konca je povinný")
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