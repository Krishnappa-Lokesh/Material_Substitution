jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"matsubs/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"matsubs/test/integration/pages/Worklist",
		"matsubs/test/integration/pages/Object",
		"matsubs/test/integration/pages/NotFound",
		"matsubs/test/integration/pages/Browser",
		"matsubs/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "matsubs.view."
	});

	sap.ui.require([
		"matsubs/test/integration/WorklistJourney",
		"matsubs/test/integration/ObjectJourney",
		"matsubs/test/integration/NavigationJourney",
		"matsubs/test/integration/NotFoundJourney",
		"matsubs/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});