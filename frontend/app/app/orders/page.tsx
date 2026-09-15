export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-text">Pedidos</h1>
      <p className="mt-1 text-[15px] text-text-muted">Orders gerados a partir de quotes aceitas</p>
      <div className="mt-10 card py-16 text-center text-text-muted">
        Nenhum pedido ainda
      </div>
    </div>
  );
}
