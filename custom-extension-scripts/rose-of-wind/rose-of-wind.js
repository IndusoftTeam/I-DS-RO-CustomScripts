function RoseOfWind() {
	const self = this

	const EventNewDataCame = "NewDataCame";
	const TX = 550
	const TY = 245.6693

	let _previousValue = NaN;

	self.main = function (idValue, idArowStart, idArrowEnd) {		

		//поиск элемента Value по идентификатору
		let windAngleValueElement = iDte.Helper.Controller.findElementById(idValue);

		if (!windAngleValueElement) {
			iDte.console.error("Не удалось найти элемент Value по идентификатору " + idValue);
			return;
		}	

		let arrowStart = findElementById(idArowStart);
		let arrowEnd = findElementById(idArrowEnd);

		if (!arrowStart) {
			iDte.console.error("Не удалось найти элемент фигуру начала стрелки по идентификатору " + idArowStart);
			return;
		}

		if (!arrowEnd) {
			iDte.console.error("Не удалось найти элемент фигуру начала стрелки по идентификатору " + idArrowEnd);
			return;
		}

		hideArrow(arrowStart, arrowEnd);

		//подписка на изменения данных элемента Value
		windAngleValueElement.addEventListener(windAngleValueElement.EVENTS.ON_DATA_CHANGE, changeDataValueElementHandler);

		//подписка на событие прихода новых данных на элементе Value
		iDte.Helper.Controller.addEventListener(EventNewDataCame, rotateArrow.bind(windAngleValueElement, windAngleValueElement, arrowStart, arrowEnd))

	}

	/**
	 * Скрыть стрелку 
	 * @param arrowStart фигура начала стрелки
	 * @param arrowEnd фигура конеца стрелки
	 */
	function hideArrow(arrowStart, arrowEnd) {
		redrawShape(arrowStart, 'd', 'M0 0 L0 -25');
		redrawShape(arrowEnd, 'd', 'M0 0 L0 -25');
	}

	/**
	 * Обработчик события изменения данных на элементе 
	 * @param valueElement элемент value 
	 */
	function changeDataValueElementHandler(valueElement) {
		let currentValue = getValueElement(valueElement);

		if (_previousValue != currentValue) {
			_previousValue = currentValue;
			iDte.Helper.Controller.dispatchEvent(EventNewDataCame);
		}
	}

	/**
	*	Выполняет вращение элемента
	*	@param elm элемент с которого получаем данные
	*	@param arrowStart фигура начала стрелки 		
	*	@param arrowStart фигура окончания стрелки 		
	*/
	function rotateArrow(elm, arrowStart, arrowEnd) {
		let value = getValueElement(elm)

		if (isNaN(value)) {
			changeViewShape(arrowStart, true)
			changeViewShape(arrowEnd, true)
		} else {
			changeViewShape(arrowStart, false)
			changeViewShape(arrowEnd, false)
		}

		let radArrowStart = getRad(value)
		let radArrowEnd = getRad(value, 180)

		arrowStart.style.transform = 'matrix(' + Math.cos(radArrowStart) + ',' + Math.sin(radArrowStart) + ',' + -Math.sin(radArrowStart) + ',' + Math.cos(radArrowStart) + ',' + TX + ',' + TY + ')';
		arrowEnd.style.transform = 'matrix(' + Math.cos(radArrowEnd) + ',' + Math.sin(radArrowEnd) + ',' + -Math.sin(radArrowEnd) + ',' + Math.cos(radArrowEnd) + ',' + TX + ',' + TY + ')';
	}

	/**
	*	Перерисовывает фигуру 
	*	@param attr атрибут рисования svg
	*	@param param параметры 		
	*/
	function redrawShape(shape, attr, param) {
		let collection = shape.children;
		let path;
		for (let i = 0; i < collection.length; i++) {
			let item = collection[i]
			if (item.toString() === "[object SVGPathElement]") {
				path = item;
				path.setAttribute(attr, param);
				hideDomElement(path);				
			}
		}

		if (!path) {
			iDte.console.warn("Не удалось изменить элемент " + shape.id)
		}
	}

	/**
	*   Изменяет отображение элемента
	*   @param shape элемент 
	*   @param isHide скрыть/отобразить 	
    */
	function changeViewShape(shape, isHide) {
		let collection = shape.children;
		for (let i = 0; i < collection.length; i++) {
			let item = collection[i]
			if (item.toString() === "[object SVGPathElement]") {
				if (isHide) {
					hideDomElement(item);					
				} else {
					showDomElement(item);
				}
			}
		}
	}

	function showDomElement(elm){
		if(!!elm){
			elm.style.display = ""
		}
	} 

	function hideDomElement(elm){
		if(!!elm){
			elm.style.display = "none"
		}
	} 

	/**
	*	Получить радианы
	*	@param degree градусы 
	*	@param offSet градусное смещение (необязательный параметр) 		
	*/
	function getRad(degree, offSet) {

		if (degree > 360) {
			degree = degree % 360
		}

		//если offSet определен, то применяем его
		if (offSet != undefined && offSet < 360) {
			degree = Math.abs(offSet + degree)
		}

		return degree * Math.PI / 180
	}

	/**
	*	Получить значение 
	*	@param elm  Value элемент мнемосхемы
	*/
	function getValueElement(elm) {
		let value = parseInt(elm.getData()[0])
		return value
	}

	/**
	*	Поиск элемена на мнемосхеме
	*	@param id идентификатор элемента (определен в данных фигуры)
	*	@return dom элемент
	*/
	function findElementById(id) {
		var custProps = iDte.Helper.Controller.getCustProps('v:custprops', 'v:cp', 'v:lbl=Id, v:val=' + id);
		if (custProps == undefined) {
			iDte.console.error("Не удалось найти элемент  по идентификатору" + id);
		}
		return $($(custProps).parent()[0]).parent()[0];
	}
}