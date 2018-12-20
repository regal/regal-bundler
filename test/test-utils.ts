import { GameResponse } from "regal";

export const lines = (response: GameResponse) =>
    response.output.log.map(ol => ol.data);
