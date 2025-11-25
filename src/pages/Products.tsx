import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Products] chamando:", `${api.defaults.baseURL}/api/produtos`);

    api
      .get("/api/produtos")
      .then((res) => {
        console.log("RESPOSTA BACKEND:", res.data);
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.error("ERRO NA REQUISIÇÃO:", err);
        setError("Erro ao carregar produtos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregando produtos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!products.length) {
    return <div>Nenhum produto cadastrado.</div>;
  }

  return (
    <div>
      <h1>Produtos</h1>
      <ul>
        {products.map((p, index) => (
          <li key={p.id ?? index}>
            {/* tenta usar campos comuns; se não tiver, mostra o JSON bruto */}
            {p.nome ?? p.description ?? "Produto"}{" "}
            {p.quantidade ?? p.quantity ?? ""}{" "}
            {p && !p.nome && !p.description && JSON.stringify(p)}
          </li>
        ))}
      </ul>
    </div>
  );
}

