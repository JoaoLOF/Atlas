import { ipcMain } from "electron";
import db from "../../database/connection.js";

export function registerUnitHandlers() {
  ipcMain.handle("units:list", () => {
    return db
      .prepare(
        `
        SELECT
          id,
          name,
          abbreviation,
          active
        FROM units
        ORDER BY name;
      `,
      )
      .all();
  });

  ipcMain.handle(
    "units:create",
    (
      _event,
      data: {
        name: string;
        abbreviation: string;
      },
    ) => {
      const result = db
        .prepare(
          `
          INSERT INTO units (
            name,
            abbreviation,
            active,
            created_at,
            updated_at
          )
          VALUES (
            @name,
            @abbreviation,
            1,
            datetime('now'),
            datetime('now')
          );
        `,
        )
        .run(data);

      return {
        id: Number(result.lastInsertRowid),
        name: data.name,
        abbreviation: data.abbreviation,
        active: true,
      };
    },
  );

  ipcMain.handle("units:deactivate", (_event, id: number) => {
    const result = db
      .prepare(
        `
          UPDATE units
          SET
            active = 0,
            updated_at = datetime('now')
          WHERE id = @id
            AND active = 1;
        `,
      )
      .run({ id });

    return result.changes > 0;
  });
}
