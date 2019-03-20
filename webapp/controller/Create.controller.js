sap.ui.define(["matsubs/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"matsubs/model/formatter"
], function(BaseController, JSONModel, History, MessageToast, formatter) {
	"use strict";

	return BaseController.extend("matsubs.controller.Create", {
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {

			this.getRouter().getRoute("createMatSubs").attachPatternMatched(this._onRouterMatched, this);
			this.registerViewWithMessageManager();

			// Model to store local view data and  control states
			var oViewModel = new JSONModel({

				/*				saveAsTileTitle: this.getResourceBundle().getText("createViewTitle"),
								shareOnJamTitle: this.getResourceBundle().getText("createViewTitle"),
								
								shareSendEmailAddress: this.getResourceBundle().getText("shareSendEmailAddress"),
								shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailcreateSubject"),
								shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailcreateMessage", [location.href]),
				*/
			});
			this.setModel(oViewModel, "createView");

			var oInput = this.getView().byId('frMaktx');
			oInput.setSuggestionRowValidator(this.suggestionRowValidator);
			oInput = this.getView().byId('toMaktx');
			oInput.setSuggestionRowValidator(this.suggestionRowValidator);

		},

		onCancel: function() {
			this.onNavBack();
		},

		onNavBack: function() {
			var oContext = this.getContext();
			// discard new record from model.
			this.getModel().deleteCreatedEntry(oContext);

			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		onSave: function(oEvent) {
			var oSaveButton = oEvent.getSource();

			// Validate screen elements before save
			/* @type  sap.m.DatePicker */
			var oDate = this.byId("_frDate");

			/* @type sap.m.ComboBox */
			var oUser = this.byId("userNamesComboBox");
			var oTeam = this.byId("teamComboBox");

			if (oDate.getValue() === "" || oDate.getValueState() === "Error") {
				oDate.setValueState(sap.ui.core.ValueState.Error);
				MessageToast.show("Please select From date ");
			}
			/* else	if (oTeam.getSelectedKey() === "") {
						oTeam.setValueState(sap.ui.core.ValueState.Error);
						MessageToast.show("Please select Team");
						} else if (oUser.getSelectedKey() === "") {
							oUser.setValueState(sap.ui.core.ValueState.Error);
							MessageToast.show("Please select Team member");
						} else

						{
			*/

			//Disable Save button to avoid multiple press by user
			oSaveButton.setEnabled(false);

			// Save data
			this.getModel().submitChanges({
				// Success Message
				success: function() {
					MessageToast.show("Data is saved!", {
						duration: 3000, // default
						width: "15em", // default
						my: sap.ui.core.Popup.Dock.CenterCenter,
						at: sap.ui.core.Popup.Dock.CenterCenter,
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: false, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			}, {
				//Error Message
				error: function() {
					MessageToast.show("Error updating record");
				}
			});
			/*			}
			 */
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */

		handleChange: function(oEvent) {
			var oText = this.byId("_frDate");
			var oDP = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._iEvent++;
			oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},

		suggestionRowValidator: function(oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return new sap.ui.core.Item({
				key: aCells[1].getText(),
				text: aCells[0].getText()
			});
		},

		matnrSeleted: function(oEvent) {
			var oSource = oEvent.getSource();
			var sSelectedKey = oSource.getSelectedKey();
			var sName = oSource.getProperty('name');

			var materialFields = {
				"frMaktx": "/FrMatnr",
				"toMaktx": "/ToMatnr"
			};

			var uomFields = {
				"frMaktx": "frMeinsComboBox",
				"toMaktx": "toMeinsComboBox"
			};

			// Add material id to model
			this.getModel().setProperty(this.getCurrentPath() + materialFields[sName], sSelectedKey);

			//Update Current stock and Base Uom
			var oMaterialModel = this.getModel("modelVhMaterial");
			var sKey = "/materialSet('" + sSelectedKey + "')";
			var oData = oMaterialModel.getData(sKey);
			if (sName == "frMaktx") {
				this.getModel().setProperty(this.getCurrentPath() + "/FrLabst", oData.UStock);
				this.getModel().setProperty(this.getCurrentPath() + "/FrMeins", oData.BaseUnit);
			} else if (sName == "toMaktx") {
				this.getModel().setProperty(this.getCurrentPath() + "/ToMeins", oData.BaseUnit);
				
			}

			// Set the respective UOMs to Combobox control
			// var sPath = "modelVhMaterial>/materialSet('" + sSelectedKey + "')/uoms";
			// var oUomComboBox = this.byId(uomFields[sName]);
			// var oItemTemplate = new sap.ui.core.ListItem({
			// 	text: "{modelVhMaterial>AltUOMDescription}",
			// 	key: "{modelVhMaterial>AltUOM}"
			// });
			// oUomComboBox.bindAggregation("items", sPath, oItemTemplate);

		},

		onCbSelectionChange: function(oEvent) {
			// Get the Key from Selected Item and bind to oData Model
			var oSource = oEvent.getSource();
			var sSelectedKey = oSource.getSelectedKey();

			var controlNames = {
				"frMatnrComboBox": "/FrMatnr",
				"toMatnrComboBox": "/ToMatnr",
				"frMeinsComboBox": "/FrMeins",
				"toMeinsComboBox": "/ToMeins",
				"spWerksComboBox": "/SpWerks",
				"deWerksComboBox": "/DeWerks"
			};
			this.getModel().setProperty(this.getCurrentPath() + controlNames[oSource.getName()], sSelectedKey);

			oSource.setValueState(sap.ui.core.ValueState.None);

		},

		onShareInJamPress: function() {
			var oViewModel = this.getModel("createView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onCheckBoxSelect: function(oEvent) {
			// Get the Key from Selected Item and bind to oData Model
			var oSource = oEvent.getSource();
			var sSelected = oSource.getSelected();

			var controlNames = {
				"checkBoxSto": "/Zsto",
				"checkBoxSC": "/ZshCart",
				"checkBoxUstk": "/UseOstk"
			};
			this.getModel().setProperty(this.getCurrentPath() + controlNames[oSource.getName()], sSelected);

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_onRouterMatched: function() {
			var oModel = this.getModel();
			oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		_onMetadataLoaded: function() {
			var oProperties = {
				"FrMatnr": "",
				"ToMatnr": "",
				"SpWerks": "",
				"DeWerks": ""
			};

			var oContext = this.getModel().createEntry("/Material_SubstitutionSet", {
				properties: oProperties,
				success: this._onCreateSuccess.bind(this)
			});

			this.getView().unbindElement();
			this.getView().setBindingContext(oContext);

			//-->>  Initialize field values
			// These fields are not bound to oData Model, that is why needs to initialize
			this.byId("frMaktx").setValue("");
			this.byId("toMaktx").setValue("");

			// this.byId("frMeinsComboBox").setValue("");
			// this.byId("frMeinsComboBox").unbindItems();
			// this.byId("toMeinsComboBox").setValue("");
			// this.byId("toMeinsComboBox").unbindItems();

			this.byId("spWerksComboBox").setValue("");
			this.byId("deWerksComboBox").setValue("");

			// Enable saveButton	
			this.byId("saveActionButton").setEnabled(true);

		},

		_onCreateSuccess: function(oItem) {
			// create key to navigate
			this.getRouter().navTo("object", {
				//objectId: oItem.keyField
				frMatnr: oItem.FrMatnr,
				toMatnr: oItem.ToMatnr,
				spWerks: oItem.SpWerks,
				deWerks: oItem.DeWerks,
				newItem: true

			}, true);

			this.getView().unbindObject();

			// Message toast - Success	
			/*			var sMessage = this.getResourceBundle().getText("newObjectCreated", [oItem.FrMatnr]);
						MessageToast.show(sMessage, {
							closeBrowserNavigation: false
						});
			*/
		}

	});

});