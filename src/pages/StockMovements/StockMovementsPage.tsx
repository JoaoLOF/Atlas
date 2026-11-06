import { useEffect, useState } from 'react';
import { getStockMovements } from '../../services/stockMovementService';

type StockMovement = Awaited<
  ReturnType<typeof getStockMovements>
>[number];

function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMovements() {
    try {
      const result = await getStockMovements();
      setMovements(result);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  function formatDate(date: string) {
    const value = new Date(date.replace(' ', 'T'));

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleString('pt-BR');
  }

  function formatMovementType(type: string) {
    switch (type) {
      case 'ENTRY':
        return 'Entrada';

      case 'EXIT':
        return 'Saída';

      case 'ADJUSTMENT':
        return 'Ajuste';

      default:
        return type;
    }
  }

  function getQuantityText(movement: StockMovement) {
    if (
      movement.movement_type === 'ENTRY'
    ) {
      return `+${movement.quantity}`;
    }

    if (
      movement.movement_type === 'EXIT'
    ) {
      return `-${movement.quantity}`;
    }

    return movement.quantity.toString();
  }

  if (loading) {
    return <p>Carregando movimentações...</p>;
  }

  return (
    <div>
      <h1>Movimentações de estoque</h1>

      {movements.length === 0 ? (
        <p>Nenhuma movimentação registrada.</p>
      ) : (
        movements.map((movement) => (
          <div key={movement.id}>
            <strong>{movement.product_name}</strong>

            <p>
              Tipo: {formatMovementType(movement.movement_type)}
            </p>

            <p>
              Quantidade: {getQuantityText(movement)}
            </p>

            {movement.reference_id !== null && (
              <p>
                Referência: {movement.reference_type} #
                {movement.reference_id}
              </p>
            )}

            {movement.notes && (
              <p>
                Observação: {movement.notes}
              </p>
            )}

            <p>
              Data: {formatDate(movement.created_at)}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default StockMovementsPage;