/**
* 	Пользовательское расширение "ProtectionElements" предназначено для ограничения прав пользователей для просмотра содержимого мнемосхемы
* 	Для использования рассширения необходимо:
* 	1)Добавить файл protection-elements.js в каталог \Indusoft\I-DS-RO\Indusoft.IDSRO2.Web\Content\publicNew\customScripts
*	2)Для обработчика события загрузки мнемосхемы добавить строку
*   var ext = iDte.extLoader('Protection'); ext.main( [ "ISPGroupName1", "ISPGroupName2" ]);
*   ,где "ISPGroupName" имя группы пользователей на сервере платформы(по умолчанию одна группа "Protect")
*	3)Для элементов мнемосхемы определить атрибут данных фигуры  protected для учета разрешения прав на данный элемент
*	4)Если для элемента необходимо ограничить права, то для атрибута protected необходимо установить значение равное 1
*   В этом случае пользователь состоящий в группе "ISPGroupName" получит права на доступ к активному элементу мнемосхемы
*/

function ProtectionElements(){
	
	var self = this;
	
	const TYPE_VALUE = 'Value';
	const ARRAY_DEFAULT_GROUPS = ['Protect'];

	let _userProfile;	
	
	/**
	*	Главная точка входа в пользовательское расширение 
	*	@param groups- массив групп в которых должен состоять пользователь 
	*/
	self.main = function(groups){		
		iDte.Helper.Controller.stopUpdate();

		let allowGroups = groups == undefined ? ARRAY_DEFAULT_GROUPS : groups;

		let protectedElements = getProtectedElements(TYPE_VALUE, "1");

		hideActiveElements(protectedElements);
		
		getUserProfile(function(userProfile){
			_userProfile = userProfile;
			
			showActiveElements(protectedElements);

			if(isAllowUserAccess(_userProfile, allowGroups) == false){
				establishBan(protectedElements);
			}
			
			iDte.Helper.Controller.beginUpdate();
		});
	}
	
	/**
	*	Проверить текущего пользователя на наличие в группе пользователей 
	*	@param userProfile - профиль текущего пользователя 
	*	@param groups - массив наименований групп в котрых должен состоять пользователь 
	*/	
	function isAllowUserAccess(userProfile, groups){

		if(userProfile == undefined)
			return false;				

		let allow = userProfile.groups.filter(groupNameUser=>{
			for(let groupNameAllow of groups){
				if(groupNameAllow.toLowerCase() === groupNameUser.toLowerCase())
					return true;
			}
			return false;
		}).length > 0;		
		
		return allow;
	}
	
	/**
	*	Получить информацию о текущем пользователе
	*  	@param userProfileLoadedCallback - функция обратного вызова, 
	*	в которую в качестве первого аргумента передается профиль текущего пользователя 
	*/	
	function getUserProfile(userProfileLoadedCallback){			
		$.ajax({
			type: "GET",
			async: false,
			url:'proxy/iwebapi/userprofile',
			success: function(userProfile){					
				if(isFunction(userProfileLoadedCallback) === true){
					userProfileLoadedCallback(userProfile)		
				}else{
					iDte.console.error("Функция обратного вызова userProfileLoadedCallback не определена!");
				}
			},
			error:function(){
				userProfileLoadedCallback();
				iDte.console.error("Не удалось получить профиль пользователя!");
			}			
		});		
	}	
	
	/**
	*	Получить защищенные элементы мнемосхемы
	*	@param type - тип элемента 
	*	@param criterion - значение атрибута protected на основании которого фильтруются элементы 
	*/	
	function getProtectedElements(type, criterion){
		let model = iDte.activeElementsModel;
		let protrctedElements = [];

		Object.getOwnPropertyNames(model).filter(svgid=>{
			let elmConfig = model[svgid];
			if(elmConfig.type === type && elmConfig.protected === criterion){
				let elm = findElementById(elmConfig.id);	
				if(elm){
					protrctedElements.push(elm);
				}				
			}
		});		
		return protrctedElements
	}

	/**
	*	Скрыть активные элементы мнемосхемы
	*	@param elements - массив активных элементов мнемосхемы
	*/	
	function hideActiveElements(elements){
		for(let elm of elements){
			let domElm = elm.getDomElement()[0];
			if(!!domElm){
				domElm.style.display = "none";
			}

		}
	}

	/**
	*	Показать активные элементы мнемосхемы
	*	@param elements - массив активных элементов мнемосхемы
	*/	
	function showActiveElements(elements){
		for(let elm of elements){
			let domElm = elm.getDomElement()[0];
			if(!!domElm){
				domElm.style.display = "";
			}

		}
	}
	
	/**
	*	Найти элемент активный элемент мнемосхемы
	*	@param id - идентификатор элемента 
	*/
	function findElementById(id){
		var elm = iDte.Helper.Controller.findElementById(id);
		if(!elm){
			iDte.console.error("Не удалось найти элемент с идентификатором "+id);
		}
		return 	elm;	
	}
		
	/**
	*	Запретить доступ к активным элементам мнемосхемы 
	*	@param elements - массив элементов
	*/
	function establishBan(elements){		
		for(let elm of elements){
			removeFromDocument(elm);
			iDte.Helper.Controller.removeElement(elm);			
		}	
	}
	
	/**
	*	Удаление из документа(страницы)
	*	@param elm - элемент мнемосхемы
	*/
	function removeFromDocument(elm){
		let domElm = elm.getDomElement()[0];
		let parent =domElm.parentNode;
		parent.removeChild(domElm);
	}	
	
	/**
	*	Проверка на тип функции
	*	@param func - указатель на функцию
	*/
	function isFunction(func){
		return typeof func === "function";
	}	
}