sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"<%= appName %>/controller/fragments/Exeption.controller",
		"<%= appName %>/model/formatter",
		"sap/ui/model/json/JSONModel",	
		"sap/m/MessageToast",			
	], function (Controller, Exeption, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("<%= appName %>.controller.BaseController", {		
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
			
		},
		setUserTheme : function(){
			var user = this.getUserSession();
			if(user.UserSettings == undefined) 
				return;
			if(!user.UserSettings.Theme)
				return;

			var theme = sap.ui.getCore().getConfiguration().getTheme();
			
			if(theme != user.UserSettings.Theme)
				sap.ui.getCore().applyTheme(user.UserSettings.Theme); 
		},

		api :{
			token : 'tokenEndPoint',
			user: 'User.json',
			notification: 'Notifications.json',
			settings:'Settings.json'
		},

		getServerUrl(){			
			let base = [];
			let serve = this.getOwnerComponent().getMetadata().getConfig().serviceUrl;
			base.push(serve);

			for (let index = 0; index < arguments.length; index++) {
				const element = arguments[index];
				base.push(element);
			}

			return base.join('/');
		},

		getModel : function (sName) {
			return this.getView().getModel(sName);
		},
		
		setUserModel : function(user){
			var userModel = new JSONModel();
            userModel.setData(user);
            sap.ui.getCore().setModel(userModel, "currentUser");			
		},
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getText: function(sKey){
			return this.getResourceBundle().getText(sKey);
		},

		onNavBack : function(sRoute, mData) {
			/* var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {		 */		
				window.history.go(-1);				
			/* } else {				
				this.redirectIfLogged();
			} */
		},	
		
		getIndexOfPath : function(sPath){
			var pathArray = sPath.split("/");
			var sIndex = pathArray[pathArray.length - 1];
			var index = Number.parseInt(sIndex);
			return index;
		},	

		getUserSession : function(){
            var user = JSON.parse(sessionStorage.getItem('currentUser'));
            if(!user || !user.Token)
                return false;
                
            return user;
		},
		setUserSession : function(sUser){
			var user = JSON.stringify(sUser);
			sessionStorage.setItem('currentUser', user)            
		},
		setUserSessionToken : function(UserAcessToken){
			var user = JSON.parse(sessionStorage.getItem('currentUser'));
			if(!user)
				user={};
			user.Token = UserAcessToken;
			var user = JSON.stringify(user);
			sessionStorage.setItem('currentUser', user);
		},
		
		destroyUserSession : function(){
			sessionStorage.clear();
            sap.ui.getCore().setModel(new JSONModel(this.EmptyUser), "currentUser");			
			
		},
		
		redirectIfLogged : function(){
			var user = this.getUserSession();
			if(user)
				this.getRouter().navTo("dashBoard");
		},

		redirectIfNotLogged : function(){
			var user = this.getUserSession();
			if(!user)
				this.getRouter().navTo("login");
		},

		loadModel(context, endPoint, nameModel, busyControls, refresh = false ){
			let model = new JSONModel();
			
			model.attachRequestSent(data => { busyControls.forEach(x => x.setBusy(true))});
            model.attachRequestCompleted(data =>{ console.log(model.getData()); busyControls.forEach(x => x.setBusy(false) )});
            model.attachRequestFailed(data =>{ busyControls.forEach(x => x.setBusy(false))});            
			model.loadData(endPoint);
			context.setModel(model, nameModel);
			if(refresh)
				context.getView().getModel(nameModel).refresh(true);
		},
		
		loadModelForDialog(context, endPoint, busyControls, successFunction, errorFunction ){
			let model =new JSONModel();
			
			model.attachRequestSent(data => {busyControls.forEach(x => x.setBusy(true))});
            model.attachRequestCompleted(data => { 
				busyControls.forEach(x => x.setBusy(false) );
				var requestReturn = data.getParameters();
				if(requestReturn.success){
					context.setModel(model);
					if(successFunction)
						successFunction();
				}else {
					MessageToast.show(requestReturn.errorobject.responseText);
					if(errorFunction)
						errorFunction();
						
				}
			});			
            model.attachRequestFailed(data =>{ busyControls.forEach(x => x.setBusy(false))});            
			model.loadData(endPoint);	
			
		},	
		
		showExeption(exeption, button){
			let ctrl =new Exeption();
			ctrl.show(exeption, button);
		}
	});
});