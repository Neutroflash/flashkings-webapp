import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Flashkings Perú",
};

const BUSINESS_LEGAL_NAME = process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME ?? "[Completar razón social]";
const BUSINESS_RUC = process.env.NEXT_PUBLIC_BUSINESS_RUC ?? "[Completar RUC]";
const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "[Completar dirección del establecimiento]";
const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "[Completar correo de privacidad]";

const h2 = "mb-2 mt-8 text-lg font-bold text-zinc-100";
const p = "text-sm leading-relaxed text-zinc-400";
const ul = "list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-400";

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="mb-2 text-3xl font-black text-zinc-100">Política de Privacidad</h1>
      <p className="mb-6 text-xs text-zinc-500">Última actualización: 28 de agosto de 2026</p>

      <div className="mb-8 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 text-xs text-zinc-500">
        <p>
          <span className="text-zinc-400">Responsable del tratamiento:</span> {BUSINESS_LEGAL_NAME}
        </p>
        <p>
          <span className="text-zinc-400">RUC:</span> {BUSINESS_RUC}
        </p>
        <p>
          <span className="text-zinc-400">Domicilio:</span> {BUSINESS_ADDRESS}
        </p>
        <p>
          <span className="text-zinc-400">Contacto de privacidad:</span> {PRIVACY_EMAIL}
        </p>
      </div>

      <p className={p}>
        Esta Política de Privacidad describe cómo Flashkings recopila, usa, protege y permite ejercer derechos sobre
        los datos personales de quienes visitan o compran en flashkings.pe, conforme a la Ley N° 29733, Ley de
        Protección de Datos Personales, y su Reglamento (D.S. N° 016-2024-JUS).
      </p>

      <h2 className={h2}>1. Datos que recopilamos</h2>
      <ul className={ul}>
        <li>Datos de contacto y envío: nombre, correo electrónico, teléfono y dirección de entrega.</li>
        <li>
          Datos de identificación, únicamente si registras un reclamo o queja en nuestro{" "}
          <Link href="/libro-de-reclamaciones" className="text-yellow-400 hover:underline">
            Libro de Reclamaciones
          </Link>
          : nombre completo, tipo y número de documento de identidad, domicilio.
        </li>
        <li>Historial de pedidos realizados en el Sitio.</li>
      </ul>
      <p className={p}>
        <strong className="text-zinc-300">No almacenamos datos de tu tarjeta de crédito o débito.</strong> Los pagos
        con tarjeta se procesan directamente por Culqi, nuestra pasarela de pagos; nuestros servidores solo reciben
        un identificador de la transacción, nunca el número de tarjeta, fecha de vencimiento ni el código de
        seguridad.
      </p>

      <h2 className={h2}>2. Finalidad del tratamiento</h2>
      <ul className={ul}>
        <li>Procesar tus pedidos, pagos y coordinar el envío de tus productos.</li>
        <li>Enviarte confirmaciones y actualizaciones sobre el estado de tu pedido por correo electrónico.</li>
        <li>Atender consultas, reclamos y quejas conforme al Libro de Reclamaciones Virtual.</li>
        <li>Cumplir obligaciones legales y tributarias aplicables a la venta de bienes en el Perú.</li>
      </ul>
      <p className={p}>
        La base legal de este tratamiento es la ejecución del contrato de compraventa que aceptas al realizar un
        pedido, y el consentimiento que otorgas al enviarnos tus datos a través de los formularios del Sitio. No
        utilizamos tus datos con fines de marketing salvo que lo autorices expresamente.
      </p>

      <h2 className={h2}>3. Encargados del tratamiento y terceros</h2>
      <p className={p}>Compartimos datos estrictamente necesarios con los siguientes proveedores, para poder prestarte el servicio:</p>
      <ul className={ul}>
        <li>
          <strong className="text-zinc-300">Culqi</strong> — pasarela de pagos certificada PCI-DSS, para procesar
          pagos con tarjeta.
        </li>
        <li>
          <strong className="text-zinc-300">Resend</strong> — proveedor de envío de correos transaccionales
          (confirmaciones de pedido y envío).
        </li>
        <li>Operadores logísticos (Olva Courier, Shalom), únicamente los datos necesarios para la entrega.</li>
      </ul>
      <p className={p}>No vendemos ni cedemos tus datos personales a terceros con fines publicitarios.</p>

      <h2 className={h2}>4. Cookies</h2>
      <p className={p}>
        El Sitio utiliza únicamente una cookie estrictamente necesaria para mantener tu sesión iniciada (por ejemplo,
        al acceder a tu cuenta). No utilizamos, por el momento, cookies de analítica ni de publicidad. Si en el
        futuro incorporamos este tipo de cookies, actualizaremos esta política y solicitaremos tu consentimiento
        antes de activarlas.
      </p>

      <h2 className={h2}>5. Plazo de conservación</h2>
      <p className={p}>
        Conservamos tus datos mientras sea necesario para cumplir las finalidades descritas y por los plazos
        adicionales que exijan las normas tributarias y contables aplicables en el Perú.
      </p>

      <h2 className={h2}>6. Seguridad</h2>
      <ul className={ul}>
        <li>Todo el tráfico del Sitio viaja cifrado mediante HTTPS.</li>
        <li>Las contraseñas se almacenan mediante funciones de hash, nunca en texto plano.</li>
        <li>La sesión se gestiona mediante cookies protegidas contra acceso desde scripts (HttpOnly) y ataques de falsificación de solicitudes.</li>
        <li>Los pagos con tarjeta se procesan íntegramente por una pasarela certificada PCI-DSS, fuera de nuestros servidores.</li>
      </ul>

      <h2 className={h2}>7. Tus derechos</h2>
      <p className={p}>
        Como titular de tus datos personales, puedes ejercer en cualquier momento tus derechos de Acceso,
        Rectificación, Cancelación, Oposición y Portabilidad, conforme a la Ley N° 29733 y su Reglamento. Para
        ejercerlos, escríbenos a {PRIVACY_EMAIL} indicando tu solicitud y adjuntando una copia de tu documento de
        identidad.
      </p>

      <h2 className={h2}>8. Menores de edad</h2>
      <p className={p}>
        El Sitio no está dirigido a menores de edad. Las compras deben ser realizadas por un adulto responsable. Si
        un menor de edad registra un reclamo a través del Libro de Reclamaciones, requerimos los datos de su padre,
        madre o apoderado.
      </p>

      <h2 className={h2}>9. Cambios a esta política</h2>
      <p className={p}>
        Podemos actualizar esta Política de Privacidad en cualquier momento. Los cambios entran en vigencia desde su
        publicación en el Sitio, indicando la fecha de última actualización en la parte superior de esta página.
      </p>

      <h2 className={h2}>10. Contacto</h2>
      <p className={p}>
        Para cualquier consulta sobre el tratamiento de tus datos personales, escríbenos a {PRIVACY_EMAIL}.
      </p>
    </div>
  );
}
