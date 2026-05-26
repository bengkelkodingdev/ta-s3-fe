"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner"; // Impor toast dari sonner
import { createLogbook } from "@/lib/api/logbook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for validation
const logbookSchema = z.object({
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  dokumen: z.string().url("Link dokumen harus berupa URL yang valid"),
  jurnalTipe: z.enum(["jurnal1", "jurnal2"]).optional(),
});

export default function AddLogbookDialog({
  type,
}: {
  type: "prociding" | "jurnal" | "disertasi";
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof logbookSchema>>({
    resolver: zodResolver(logbookSchema),
    defaultValues: {
      deskripsi: "",
      dokumen: "",
      jurnalTipe: "jurnal1",
    },
  });

  async function onSubmit(values: z.infer<typeof logbookSchema>) {
    setIsSubmitting(true);

    try {
      const effectiveType =
        type === "jurnal" ? (values.jurnalTipe ?? "jurnal1") : type;
      await createLogbook(effectiveType, values);

      toast.success(`Logbook ${type} berhasil dibuat`, {
        description: "Berhasil",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui status logbook",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" /> Tambah Logbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Tambah Logbook {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Isi form berikut untuk menambahkan logbook baru
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dokumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Dokumen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "jurnal" && (
              <FormField
                control={form.control}
                name="jurnalTipe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Jurnal</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe jurnal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="jurnal1">Jurnal 1</SelectItem>
                        <SelectItem value="jurnal2">Jurnal 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
