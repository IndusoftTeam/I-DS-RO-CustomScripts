/**
*	Пользовательское расширение портала, позволяющее создать разметку для контейнера (DIV) по позиции и размерам фигуры - прямоугольник на мнемосхеме.
*	Для использования расширения необходимо, создать мнемосхему с фигурой - прямоугольник. В данных фигуры (Visio) определить атрибуты:
*	- Type = CustomFigure
*	- Markup = 	true
*	- Id = table
*	Для подключения пользовательского расширения, необходимо добавить текущий файл  (markup.js) в каталог
*	\I-DS-RO\Indusoft.IDSRO2.Web\Content\publicNew\customScripts.
*
* 	В TSVA в свойствах мнемосхемы -> вкладка события разместть код:
*	var ext = iDte.extLoader('container-markup');  ext.main();
*	
*/
function ContainerMarkup() {
	const self = this
	var _listners = [] //слушатели события масштабирования мнемосхемы

	self.main = function () {
		let configElemets = getElementsConfig("customfigure", "markup");

		let elements = getElementsById(configElemets, "table")

		elements.forEach(elm => {
			initialization(elm)
			_listners.push(elm)
		});

		getController().addEventListener(getController().EVENTS.ON_SVG_CHANGED, resizeHandler) //подписка на событие масштабирования мнемосхемы
		resizeHandler()
	}

	/**
	*	Получить элемент по id
	*	@param configElements - массив с конфигурацией элементов 
	*	@param id - идентификатор элемента
	*/
	function getElementsById(configElements, id) {
		let result = []
		configElements.forEach(item => {
			if (item.id == id) { //фильтрация по идентификатору "table"
				let elm = findElementById(item.id) //				
				if (elm) {
					result.push(elm)
				}
			}
		});
		return result;
	}

	/**
	*	Получить элемент по id
	*	@param configElements - массив с конфигурацией элементов 
	*	@param ids - массив с идентификаторами элементов
	*/
	function getElementsByIds(configElements, ids) {
		let result = []
		configElements.forEach(elmConfig => {
			ids.forEach(id => {
				if (elmConfig.id == id) { //фильтрация по идентификатору "table"
					let elm = findElementById(elmConfig.id) //				
					if (elm) {
						result.push(elm)
					}
				}
			})
		});
		return result;
	}

	/**
	*	Обработчик события масштабирования мнемосхемы
	*/
	function resizeHandler() {
		_listners.forEach(elm => {
			elm.resizePossition();
		})
	}

	/**
	*	Сконфигурировать контейнер
	*	@param elm- элемент мнемосхемы 	
	*/
	function initialization(elm) {
		let container = buildContainerForElement(elm)
		elm.getController().attachAdditionalBody(container)
		elm.Container = container;
		elm.resizePossition = function () {
			resizePossition(elm.getElementId());
		}
	}

	/**
	*	Собрать контейнер
	*	@param elm- элемент мнемосхемы 	
	*/
	function buildContainerForElement(elm) {
		let container = createContainer(elm.getElementId())
		let bounds = getSize(elm);
		setSizeContainer(container, bounds);
		return container
	}

	/**
	*	Создать контейнер
	*	@param selector - идентификатор  	
	*/
	function createContainer(selector) {
		let container = $(`<div id='${selector}' class="containerMarkup"></div>`);
		container.css({
			position: "absolute",
			'z-index': '1'
		});
		return container
	}

	/**
	*	Получить размер границ элемента
	*	@param elm- элемент мнемосхемы	
	*/
	function getSize(elm) {
		return {
			width: getDomRect(elm).width(),
			height: getDomRect(elm).height()
		}
	}

	/**
	*	Установить размер контейнера
	*	@param container - контейнер	
	*	@param bounds - размер границ	
	*/
	function setSizeContainer(container, bounds) {
		container.css({
			width: bounds.width,
			height: bounds.height
		});
	}

	/**
	*	Получить svg rect
	*	@param elm- элемент мнемосхемы	
	*/
	function getDomRect(elm) {
		return elm.getDomElement().children("rect");
	}

	/**
	*	Масштабирование контейнера
	*	@param id- идентификатор элемента мнемосхемы	
	*/
	function resizePossition(id) {
		let elm = findElementById(id);
		let rect = getDomRect(elm)
		let offset = elm.getController().getSvgElementPositionRelativeBody(rect);
		let scale = elm.getController().getScaleMnemosheme();
		let bounds = rect[0].getBoundingClientRect();
		setPossition(elm, offset.left, offset.top, bounds.width, bounds.height)
	}

	/**
	*	Установить размер и позицию для контейнера
	*	@param elm- элемент мнемосхемы	
	*/
	function setPossition(elm, left, top, width, height) {
		elm.Container.css({
			'left': left,
			'top': top,
			'width': width,
			'height': height
		});
	}

	/**
	*	Получить конфигурацию  мнемосхемы у которых определено свойство 
	*	@param elementType- тип элемента, например Button, VAlue
	*	@param propertyName- имя свойства, например id, Description 
	*/
	function getElementsConfig(elementType, propertyName) {
		var elements = [];
		if (elementType == undefined || propertyName == undefined)
			return elements

		let model = iDte.activeElementsModel;
		Object.keys(model).filter(gropId => {
			let elmConfig = model[gropId];
			if (elmConfig.type != undefined &&
				elmConfig.type.toLowerCase() == elementType.toLowerCase()) {
				if (checkProperty(elmConfig, propertyName)) {
					elements.push(elmConfig);
				}
			}
		});
		return elements
	}

	/**
	*	Проверка наличия свойства у объекта
	*	@param obj- объект
	*	@param propertyName- имя свойства 
	*	@return true - есть, false - нет 
	*/
	function checkProperty(obj, propertyName) {
		let result = false;
		Object.keys(obj).filter(property => {
			if (property.toLowerCase() == propertyName.toLowerCase()) {
				result = true;
			}
		});
		return result
	}

	/**
	*	Получить контроллер мнемосхемы	
	*/
	function getController() {
		return iDte.Helper.Controller;
	}

	/**
	*	Поиск элемента мнемосхемы
	*	@param id - уникальный идентификатор (свойство id из данных фигуры) элемента  
	*/
	function findElementById(id) {
		let elm = getController().findElementById(id);
		if (!elm) {
			iDte.console.error("Не удалось найти элемент с идентификатором " + id);
		}
		return elm;
	}
}