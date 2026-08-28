import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | Flashkings Perú",
};

const BUSINESS_LEGAL_NAME = process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME ?? "[Completar razón social]";
const BUSINESS_RUC = process.env.NEXT_PUBLIC_BUSINESS_RUC ?? "[Completar RUC]";
const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "[Completar dirección del establecimiento]";

const h2 = "mb-2 mt-8 text-lg font-bold text-zinc-100";
const p = "text-sm leading-relaxed text-zinc-400";
const ul = "list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-400";

export default function TerminosYCondicionesPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="mb-2 text-3xl font-black text-zinc-100">Términos y Condiciones</h1>
      <p className="mb-6 text-xs text-zinc-500">Última actualización: 28 de agosto de 2026</p>

      <div className="mb-8 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 text-xs text-zinc-500">
        <p>
          <span className="text-zinc-400">Proveedor:</span> {BUSINESS_LEGAL_NAME}
        </p>
        <p>
          <span className="text-zinc-400">RUC:</span> {BUSINESS_RUC}
        </p>
        <p>
          <span className="text-zinc-400">Domicilio del establecimiento:</span> {BUSINESS_ADDRESS}
        </p>
      </div>

      <p className={p}>
        Estos Términos y Condiciones regulan el uso del sitio web flashkings.pe (el &quot;Sitio&quot;) y las compras
        realizadas a través de él. Al navegar el Sitio o realizar un pedido, aceptas estos términos. Si no estás de
        acuerdo, te pedimos no utilizar el Sitio.
      </p>

      <h2 className={h2}>1. Productos y precios</h2>
      <p className={p}>
        Los precios se muestran en Soles (S/) e incluyen el Impuesto General a las Ventas (IGV). Los precios y la
        disponibilidad de stock pueden cambiar sin previo aviso. Si detectamos un error evidente de precio en un
        pedido ya realizado, te contactaremos antes de procesar el cobro para que decidas si continuar con la compra
        al precio correcto o cancelarla sin costo alguno.
      </p>

      <h2 className={h2}>2. Proceso de compra y reserva de stock</h2>
      <p className={p}>
        Al agregar un producto al carrito y avanzar al pago, reservamos el stock correspondiente por un tiempo
        limitado mientras completas la compra. Si el pago no se confirma dentro de ese plazo, la reserva se libera
        automáticamente y el stock vuelve a estar disponible para otros compradores.
      </p>

      <h2 className={h2}>3. Medios de pago</h2>
      <p className={p}>
        Aceptamos tarjetas de crédito/débito procesadas mediante Culqi, una pasarela de pagos certificada. No
        almacenamos los datos de tu tarjeta en nuestros servidores: Culqi los procesa directamente y solo nos entrega
        un identificador de la transacción. También aceptamos Yape y Plin mediante verificación manual: nos indicas
        el número de operación de tu transferencia y confirmamos el pago antes de preparar tu pedido.
      </p>

      <h2 className={h2}>4. Envíos</h2>
      <p className={p}>
        Realizamos envíos a todo el Perú a través de Olva Courier y Shalom. Los plazos de entrega informados en el
        Sitio son referenciales y pueden variar según el destino y la disponibilidad del courier. El riesgo de
        pérdida o daño del producto durante el transporte es asumido por Flashkings hasta la entrega al destinatario.
      </p>

      <h2 className={h2}>5. Garantías y devoluciones</h2>
      <p className={p}>
        Conforme al artículo 97 del Código de Protección y Defensa del Consumidor (Ley N° 29571), todo producto
        cuenta con garantía legal frente a defectos de fabricación o cuando no corresponda a las condiciones
        ofrecidas al momento de la compra. Si tu producto llega dañado, con fallas de fabricación, o no corresponde a
        lo que compraste, contáctanos por WhatsApp o a través de nuestro{" "}
        <Link href="/libro-de-reclamaciones" className="text-yellow-400 hover:underline">
          Libro de Reclamaciones
        </Link>{" "}
        y coordinaremos el cambio, la reparación o la devolución según corresponda.
      </p>
      <p className={p}>
        La legislación peruana vigente no contempla, para las compras por internet en general, un derecho de
        retracto o arrepentimiento distinto a esta garantía legal. Cualquier política adicional de cambios (por
        ejemplo, por elección personal y no por defecto del producto) que Flashkings decida ofrecer de forma
        voluntaria se comunicará de forma expresa en el Sitio o al momento de la compra.
      </p>

      <h2 className={h2}>6. Cancelación de pedidos</h2>
      <p className={p}>
        Puedes cancelar tu pedido sin costo mientras no se haya confirmado el pago. Una vez confirmado el pago,
        cualquier cancelación se rige por la política de garantías y devoluciones descrita arriba. Flashkings puede
        cancelar un pedido y reembolsar el pago si el producto se agotó antes de confirmarse el stock, o ante indicios
        razonables de fraude.
      </p>

      <h2 className={h2}>7. Propiedad intelectual</h2>
      <p className={p}>
        Las marcas, logotipos, textos, imágenes y demás contenido del Sitio son propiedad de Flashkings o de sus
        respectivos titulares, y están protegidos por la legislación de propiedad intelectual aplicable. No está
        permitido reproducirlos sin autorización previa.
      </p>

      <h2 className={h2}>8. Protección de datos personales</h2>
      <p className={p}>
        El tratamiento de tus datos personales se rige por nuestra{" "}
        <Link href="/politica-de-privacidad" className="text-yellow-400 hover:underline">
          Política de Privacidad
        </Link>
        .
      </p>

      <h2 className={h2}>9. Libro de Reclamaciones</h2>
      <p className={p}>
        Este establecimiento cuenta con un Libro de Reclamaciones Virtual a tu disposición, conforme al D.S. N°
        011-2011-PCM.{" "}
        <Link href="/libro-de-reclamaciones" className="text-yellow-400 hover:underline">
          Registrar un reclamo o queja
        </Link>
        .
      </p>

      <h2 className={h2}>10. Responsabilidad</h2>
      <ul className={ul}>
        <li>Flashkings no será responsable por retrasos o incumplimientos causados por caso fortuito o fuerza mayor.</li>
        <li>
          Nada en estos Términos limita los derechos irrenunciables que la Ley N° 29571 reconoce a los consumidores.
        </li>
      </ul>

      <h2 className={h2}>11. Legislación aplicable y fuero</h2>
      <p className={p}>
        Estos Términos se rigen por las leyes de la República del Perú. Ante cualquier controversia, y conforme a la
        protección que la ley otorga al consumidor, este podrá acudir a las autoridades competentes de su propio
        domicilio.
      </p>

      <h2 className={h2}>12. Modificaciones</h2>
      <p className={p}>
        Podemos actualizar estos Términos en cualquier momento. Los cambios entran en vigencia desde su publicación
        en el Sitio, indicando la fecha de última actualización en la parte superior de esta página.
      </p>

      <h2 className={h2}>13. Contacto</h2>
      <p className={p}>
        Si tienes preguntas sobre estos Términos, escríbenos por WhatsApp o a través de nuestro{" "}
        <Link href="/libro-de-reclamaciones" className="text-yellow-400 hover:underline">
          Libro de Reclamaciones
        </Link>
        .
      </p>
    </div>
  );
}
