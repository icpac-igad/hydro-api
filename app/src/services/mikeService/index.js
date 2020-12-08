const { db } = require("./db");
const dbgeo = require("dbgeo");
const { promisify } = require("util");

const dbGeoParse = promisify(dbgeo.parse).bind(dbgeo);

class MikeService {
  constructor(db) {
    this.db = db;
    this.schema = "workspace1";
  }

  async getFeatureGroups() {
    return this.db.any("SELECT id,name FROM workspace1.feature_class_group");
  }

  async getFeatureClassesByGroup(groupId) {
    return this.db.any(
      "SELECT id,name,table_name FROM workspace1.feature_class where group_id = $1",
      groupId
    );
  }

  async getFeatureClassAsGeojson(table) {
    let data = await this.db.any("SELECT * FROM workspace1.$1:name", [table]);

    const featureClass = await this.db.one(
      "SELECT * FROM workspace1.feature_class where table_name=$1",
      table
    );

    if (featureClass) {
      data = data.map((d) => ({ ...d, f_name: featureClass.name }));
    }

    const geojson = dbGeoParse(data, {
      outputFormat: "geojson",
      geometryColumn: "geometry",
      precision: 6,
    });

    return geojson;
  }

  async getTimeseriesMainGroups() {
    return await this.db.any(
      "SELECT id,name FROM workspace1.time_series_group where parent_id IS NULL"
    );
  }

  async getTimeseriesGroupsByParent(parentId) {
    return await this.db.any(
      "SELECT * FROM workspace1.time_series_group where parent_id = $1",
      parentId
    );
  }

  async getTimeseriesByGroupNameAndFeatureId(mikeDbType, groupName, featureId) {
    // get the parent group. This is the root group with no parent
    const parentGroup = await this.db.oneOrNone(
      "SELECT id FROM workspace1.time_series_group where name=$1 AND parent_id IS NULL",
      mikeDbType
    );

    if (parentGroup) {
      // get timeseries that matches parentGroup, feature id and group name
      return await this.db.oneOrNone(
        "SELECT ts.id FROM workspace1.time_series as ts, workspace1.time_series_group as tsg WHERE ts.name=$1 AND ts.group_id = tsg.id AND tsg.Name=$2 AND tsg.parent_id=$3",
        [featureId, groupName, parentGroup.id]
      );
    }

    throw {
      status: 404,
      message: "parentGroup not found",
    };
  }

  async getTimeseriesValues(mikeDbType, groupName, featureId) {
    const timeseries = await this.getTimeseriesByGroupNameAndFeatureId(
      mikeDbType,
      groupName,
      featureId
    );

    if (timeseries) {
      return this.db.any(
        "SELECT date_time,data_value FROM workspace1.time_series_value where time_series_id = $1",
        [timeseries.id]
      );
    }

    throw {
      status: 404,
      message: "Timeseries not found for given group and feature id",
    };
  }
}

module.exports = new MikeService(db);
