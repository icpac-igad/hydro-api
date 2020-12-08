const Router = require("koa-router");
const MikeService = require("services/mikeService");

const router = new Router({
  prefix: "/flow",
});

class FlowRouter {
  static async getFeatureGroups(ctx) {
    ctx.body = await MikeService.getFeatureGroups();
  }

  static async getFeatureClassesByGroup(ctx) {
    ctx.assert(ctx.params.group_id, 400, "group_id param not found");

    ctx.body = await MikeService.getFeatureClassesByGroup(ctx.params.group_id);
  }

  static async getFeatureClass(ctx) {
    ctx.assert(ctx.params.table, 400, "table param not found");

    ctx.body = await MikeService.getFeatureClassAsGeojson(ctx.params.table);
  }

  static async getTimeseriesMainGroups(ctx) {
    ctx.body = await MikeService.getTimeseriesMainGroups();
  }

  static async getTimeseriesGroupsByParent(ctx) {
    ctx.assert(ctx.params.parent_id, 400, "parent_id param not found");

    ctx.body = await MikeService.getTimeseriesGroupsByParent(
      ctx.params.parent_id
    );
  }

  static async getTimeseriesValues(ctx) {
    ctx.assert(ctx.params.mike_db_type, 400, "mike_db_type param not found");
    ctx.assert(ctx.params.group_name, 400, "group_id param not found");
    ctx.assert(ctx.params.feature_id, 400, "feature_id param not found");

    ctx.body = await MikeService.getTimeseriesValues(
      ctx.params.mike_db_type,
      ctx.params.group_name,
      ctx.params.feature_id
    );
  }
}

router.get("/featuregroups", FlowRouter.getFeatureGroups);
router.get("/featureclasses/:group_id", FlowRouter.getFeatureClassesByGroup);
router.get("/featureclass/:table", FlowRouter.getFeatureClass);
router.get("/timeseriesgroups", FlowRouter.getTimeseriesMainGroups);
router.get(
  "/timeseriesgroups/list/:parent_id",
  FlowRouter.getTimeseriesGroupsByParent
);
router.get(
  "/timeseries/:mike_db_type/:group_name/:feature_id",
  FlowRouter.getTimeseriesValues
);

module.exports = router;
