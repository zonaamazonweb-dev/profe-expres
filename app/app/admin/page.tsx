import { PageTitle, SinDatos } from "@/components/admin/ui";

export default function ResumenPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Resumen" sub="Tu negocio de un vistazo." />
      <SinDatos>El resumen se arma en la siguiente capa.</SinDatos>
    </div>
  );
}
