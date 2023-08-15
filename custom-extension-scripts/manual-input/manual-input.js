/**
*	Пользовательское расширение "ManualInput" предназначено для организации ручного ввода значений в источник данных элемента Value
* 	Для использования рассширения необходимо:
* 	1) Добавить файл manual-input.js в каталог \Indusoft\I-DS-RO\Indusoft.IDSRO2.Web\Content\publicNew\customScripts
*	2) Для обработчика события загрузки мнемосхемы добавить строку
*      var ext = iDte.extLoader('manual-input'); ext.main();
* 	3) Для Value элементов мнемосхемы определить атрибут данных фигуры  writedata
*	4) Если для элемента Value разрешена запись значений, то для атрибута writedata необходимо установить значение 1
*	5) Добавить на мнемосхему элемент Button, в обработчик события нажатия на кнопку добавить iDte.btnManualInputClick()
*	,где iDte.btnManualInputClick - обработчик события нажатия на кнопку активации ручного ввода в глобальной области видемости мнемосхемы (реализован в расширении)
*	6) Для элемента мнемосхемы Button определить атрибут данных фигуры  BtnManualInput (для поиска кнопки)
*/

function ManualInput (){
	var self = this;
	
	let _isActiveInput = false;
	let _btnManualInput;
	let _writebleValueElements;
	
	/**
	*	Главная точка входа в пользовательское расширении
	*/
	self.main = function(){
		
		registerBtnManualInputListners();
			
		_btnManualInput = getBtnManualInput();
		
		_writebleValueElements = getWritebleValueElements();
		
		iDte.Helper.Controller.addEventListener(iDte.Helper.Controller.EVENTS.ON_SVG_CHANGED, function(){
			for(let elm of _writebleValueElements){
				elm.risize();
			}
		});
	}
	
	/**
	*	Обработчик события нажатия на кнопку активации ручного ввода
	*/
	function btnManualInputClick(){
		_isActiveInput = !_isActiveInput;
	
		if(_isActiveInput === true){
			iDte.Helper.Controller.stopUpdate();	
			changeTextOnElementButton("Записать");
			
			for(let elm of _writebleValueElements){
				elm.activate();
			}
		}else{
			changeTextOnElementButton("Ручной ввод");
			
			for(let elm of _writebleValueElements){
				elm.hide();
			}
			
			for(let elm of _writebleValueElements){
				elm.writeData();
			}

			iDte.Helper.Controller.updateDataDirectly(iDte.Helper.Controller.getAllElements());	
			iDte.Helper.Controller.beginUpdate();
		}
	}
	
	/**
	*	Регистрация слушателей события нажатия на кнопку активации ручного ввода
	*/
	function registerBtnManualInputListners(){
		iDte.btnManualInputClick = btnManualInputClick; //регистрация обработчика события нажатия на кнопку активации ручного ввода в глобальной области видемости мнемосхемы
		
		document.addEventListener("keypress", function(e) {//событие нажатия клавиши Enter
			if(e.key == "Enter"){
				iDte.btnManualInputClick();
			}
		})
	}
	
	/**
	*	Получить кнопку активации ручного ввода
	*/
	function getBtnManualInput(){
		let configBtnManualInput = getConfigBtnManualInputByPropertyName("BtnManualInput");
		
		if(!configBtnManualInput){
			iDte.console.warn("Не удалось найти на мнемосхеме кнопку с атрибутом BtnManualInput в определении данных фигуры!");
		}else{
			let btnManualInput = iDte.Helper.Controller.findElementById(configBtnManualInput.id);
			return btnManualInput;
		}
	}
	
	/**
	*	Получить элементы Value для который разрешена запись	
	*/	
	function getWritebleValueElements(){
		let nameValueElements  = Object.keys(iDte.activeElementsModel).filter(function(v){
			if(iDte.activeElementsModel[v].type === 'Value'){ //фильтрация по типу Value
				if(!!iDte.activeElementsModel[v].writedata) 
					return iDte.activeElementsModel[v].writedata === "1";//фильтрация по атрибуту writedata в определении данных фигуры
			}
		})
		
		let writebleValueElements = [];
		
		for(let nameElmConfig of nameValueElements){
			let elmConfig = iDte.activeElementsModel[nameElmConfig];
			let elmValue = iDte.Helper.Controller.findElementById(elmConfig.id);
			if(!!elmValue){
				let writebleValue = new ValueElementWritebale(elmValue);
				writebleValueElements.push(writebleValue);
			}
		}
		
		return writebleValueElements;
	}
	
	/**
	*	Получить конфигурацию кнопки активации ручного ввода	
	*	@param propertyName - имя атрибута в определении данных фигуры, на основании которого будет осущетвляться поиск кнопки
	*/	
	function getConfigBtnManualInputByPropertyName(propertyName){
		
		let activeElementsModelKeys = Object.keys(iDte.activeElementsModel);
		
		for (let i = 0; i < activeElementsModelKeys.length; i++) {
			let elmPropertyName = activeElementsModelKeys[i];
			let elmConfig = iDte.activeElementsModel[elmPropertyName];

			if(!elmConfig.type || elmConfig.type.toLowerCase()!= "button")
				continue;
				
			let elmConfigKeys = Object.keys(elmConfig);
			
			for (let j = 0; j < elmConfigKeys.length; j++) {
				let elmConfigPropertyName = elmConfigKeys[j];
				if(elmConfigPropertyName.toLowerCase() === propertyName.toLowerCase()){
					return elmConfig;
				}
			}	
		}
	}		
	
	/**
	*	Изменить отображаемый текст на кнопке
	*	@param text - текст
	*/	
	function changeTextOnElementButton(text){
		let tagText = _btnManualInput.getDomElement().children("text");
		tagText.text(text);
	}
	
	/**
	*	Класс описывающий активный элемент Value с возможностью записи новых значений в источник данных
	*/
	function ValueElementWritebale(valueElement){
		let self = this;
		let _valueElement;
		let _writebaleContainer;
		let _inputData;
		let _defaultStokeParams;
		let _isActiveInput = false;
			
		function constructor(){
			_valueElement = valueElement;
			_writebaleContainer = createWritebleValueContainer();
			_inputData = _writebaleContainer.children("input");
			_defaultStokeParams = getStrokeParams();
			rigisterEventListners();
		}
		
		/**
		*	Активация элемента для возможности ввода данных
		*/
		self.activate = function(){
			_isActiveInput = true;
			setStroke("lime", 3);
			clearInputData();
		}
		
		/**
		*	Отобразить поле ввода данных
		*/
		self.show = function(){
			clearInputData();
			self.risize();
			_writebaleContainer.show();
		}
		
		/**
		*	Скрыть поле ввода данных
		*/
		self.hide = function(){
			removeStroke();
			_writebaleContainer.hide();
			_isActiveInput = false;
		}	
		
		/**
		*	Изменить размер и положение поля ввода данных
		*/
		self.risize = function(){
			let elmDom = _valueElement.getDomElement();
			let elmPositions = iDte.Helper.Controller.getSvgElementPositionRelativeBody(elmDom);
			let elmBounds = $(elmDom).find('rect')[0].getBoundingClientRect();
					
			_writebaleContainer.css({
				width: elmBounds.width,
				height: elmBounds.height,
				left: elmPositions.left,
				top: elmPositions.top,
				position: "absolute",
				'z-index': '1'
			});
			
			let scale = getSvgScale();
			let fontSize = parseFloat(elmDom.children('text').css('font-size'));
			let newFontSize = fontSize * scale * 3;
			
			_writebaleContainer.children('#InputData').css('font-size', newFontSize + 'px');
		}
		
		/**
		*	Получить введенные данных для записи
		*/
		self.getWriteData = function(){
			let val = _inputData.val();
			
			if(!val)
				return;
				
			return {
				tag: _valueElement.getDataId(),
				time: new Date().getTime(),
				value: val
			}
		}
		
		/**
		*	Записать данные в источник данных
		*/
		self.writeData = function(){
			let writeData = self.getWriteData();
			
			if(!writeData)
				return;
			
			let request = {
				items: [ writeData ]
			};
			
			$.ajax({
				url: "/proxy/iwebapi/idsro/rtd/valueswrite",
				method: "post",
				contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
				data: request, 
				success: function (response) {
					
					if(response.items.length > 0){
						if(response.items[0].status === 0){
							log("Записано значение "+writeData.value+" в "+writeData.tag);
						}else{
							iDte.console.error("Ошибка при записи значения в "+writeData.tag+"\n" + response.items[0].message);
						}	
						return;
					}
					iDte.console.error("Неизвестная ошибка при записи значения в "+writeData.tag);
				},
				error: function (err) {
					 iDte.console.error("Ошибка при записи значения в "+writeData.tag+"\n" + err);
				}
			})
			
		}
		
		/**
		*	Создать контейнер с полем для ввода данных
		*/
		function createWritebleValueContainer(){
			let container = $("\
				<div id='"+_valueElement.getElementId()+"' class='writevleValueContainer'> \
					<input id='InputData' style='width:100%;height:100%;position:absolute;top:0px; color:black;'\>\
				</div>");
				
			iDte.Helper.Controller.attachAdditionalBody(container);	
			container.hide();
			return container;
		}
			
		/**
		*	Регистрация слушателей событий для поля данных
		*/
		function rigisterEventListners(){
			let elmDom = _valueElement.getDomElement();
			elmDom.on('mouseup', writebleValueElementClick);//открытие поля для ввода данных	
			_writebaleContainer.on('mouseout', inputDataChange); //скрыть поле для ввода данных после выхода мышки из области
			_inputData.on("change", inputDataChange); //скрыть поле для ввода данных после ввода значения
		}
		
		/**
		*	Обработчик события нажатия на элемент Value
		*/
		function writebleValueElementClick(){
			if(_isActiveInput === false)
				return;
				
			hideStandartTooltip();
			self.show();
		}
		
		/**
		*	Обработчик события ввода данные
		*/
		function inputDataChange(){
			_writebaleContainer.hide();	
			let value = _inputData.val();
			_valueElement.setData([value]);
		}		
		
		/**
		*	Выделить элемент Value
		*	@param stokeColor - цвет линий 
		*	@param stokeColor - толщина линий
		*/
		function setStroke(stokeColor, stokeWidth){
			let elmDom = _valueElement.getDomElement();
			elmDom.children('rect').css('stroke', stokeColor);
			elmDom.children('rect').css('stroke-width', stokeWidth);
		}	
		
		/**
		*	Убрать выделении для элемента Value
		*/
		function removeStroke (){
			let elmDom = _valueElement.getDomElement();
			elmDom.children('rect').css('stroke', _defaultStokeParams.strokeColor);
			elmDom.children('rect').css('stroke-width', _defaultStokeParams.strokeWidth);
		}
		
		/**
		*	Получить параметры для выделения элемента Value из его конфигурации
		*/
		function getStrokeParams(){
			let elmDom = _valueElement.getDomElement();
			return {
				strokeColor: elmDom.children('rect').css('stroke'),
				strokeWidth: elmDom.children('rect').css('stroke-width')
			}
		}
		
		/**
		*	Получить шкалу мнемосхемы
		*/
		function getSvgScale(){
			let svg = iDte.Helper.Controller.getSvg();
			let viewBox = svg.getBoundingClientRect();
			let width = svg.getBBox().width;
			let height = svg.getBBox().height;
			return Math.min(width/viewBox.width, height/viewBox.height);
		}
		
		/**
		*	Скрыть всплывающую подсказку для элемента Value
		*/
		function hideStandartTooltip(){
			$("#tooltip-menu").remove();
			$(".tooltip-element").remove();
			$(".ui-draggable").remove();
		}	
		
		/**
		*	Очистить поле ввода данных
		*/
		function clearInputData(){
			_inputData.val("");
		}
			
		/**
		*	Логирование для отладки
		*/			
		function log(message){
			if(iDte.debugEnabled === true){
				iDte.console.info(message);
			}
		} 
		
		constructor();
	}
}