import { useEffect, useState } from "react";
import {
  createUnit,
  deactivateUnit,
  getUnits,
} from "../../services/unitService";

type Unit = Awaited<ReturnType<typeof getUnits>>[number];

function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");

  async function loadUnits() {
    const result = await getUnits();
    setUnits(result);
  }

  useEffect(() => {
    loadUnits();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !abbreviation.trim()) {
      return;
    }

    await createUnit({
      name: name.trim(),
      abbreviation: abbreviation.trim().toUpperCase(),
    });

    setName("");
    setAbbreviation("");

    await loadUnits();
  }

  async function handleDeactivate(id: number) {
    await deactivateUnit(id);
    await loadUnits();
  }

  return (
    <div>
      <h1>Unidades</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Unidade"
            required
          />
        </div>

        <div>
          <label>Abreviação</label>

          <input
            value={abbreviation}
            onChange={(event) => setAbbreviation(event.target.value)}
            placeholder="Ex.: UN"
            maxLength={10}
            required
          />
        </div>

        <button type="submit">Cadastrar unidade</button>
      </form>

      <hr />

      <h2>Unidades cadastradas</h2>

      {units.length === 0 ? (
        <p>Nenhuma unidade cadastrada.</p>
      ) : (
        units.map((unit) => (
          <div key={unit.id}>
            <strong>
              {unit.name} ({unit.abbreviation})
            </strong>

            <p>Status: {unit.active ? "Ativa" : "Inativa"}</p>

            {unit.active && (
              <button onClick={() => handleDeactivate(unit.id)}>
                Desativar
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default UnitsPage;
