// routes/log.router.ts
import {router, publicProcedure} from "../trpc";
// please don't use this router for any backend calls only use it for gettting types on the frontend
export const typeRouter = router({
	getTypes: publicProcedure.query(async () => {
		// let stockDetailUpdateType: StockDetailUpdate = {} as StockDetailUpdate;

		// let swingPointType = {} as SwingPoint;
		// let positionType = {} as Position;
		// let positonClassType = {} as IPositionModel;
		// let srLevelType = {} as SRLevel;
		// let levelType = {} as LevelType;

		return {};
	}),
});
