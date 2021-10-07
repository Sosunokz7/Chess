define(['./../../node_modules/lodash/lodash.min',
    './lib/range',

], function (_, range) {

    class ChessPieces {

        constructor(color, { collum, row }) {
            this.color = color;
            this.position = { collum, row };
            this.cellsForMove = [];
            this.numberOfChecks = 4;//Количество условий для проверки
            this.strokeNumberMoves = 0;//Количество сделанных ходов вибронной фигурой
            this.type = 'figure';

        }
        static checkToKing = false;
        position() {
            return this.position;
        }
        getDirection(index, selfPosition) { }

        getWhereCanMoves(arrPieces) {//Получение возможных позиций для хода 
            const addToArray = function (selfPosition, whileIndex, roadCells) {
                if (this.checkForAddToArr(selfPosition, whileIndex, roadCells))
                    this.cellsForMove.push(_.cloneDeep(selfPosition));
            }.bind(this);//Проверка, перед записью позиции
            this.cellsForMove = [];
            for (let i = 1; i <= this.numberOfChecks; i++) {
                let selfPosition = _.cloneDeep(this.position);
                let roadCells, whileIndex = 0;
                do {
                    ++whileIndex;
                    this.getDirection(i, selfPosition);//Алгоритм по которому смотрим как может двигаться фигура 
                    if (range.between(1, 8, selfPosition.collum) && range.between(1, 8, selfPosition.row)) {//Существует ли такая клетка
                        roadCells = _.find(arrPieces, (item) => _.isEqual(item.position, selfPosition))//Поиск фигуры на клетке
                        if (!_.isUndefined(roadCells)) {//Есть ли на этой клетке фигура 
                            addToArray(selfPosition, whileIndex, roadCells);
                            break;
                        }
                        addToArray(selfPosition, whileIndex, roadCells);
                    }
                    else break;

                } while (this.cycleConditions(true, whileIndex, i) || whileIndex > 200)
            }
        }

        checkForAddToArr(selfPosition, whileIndex) {//Проверка на добавление позиции в массив возможных ходов
            return !_.isEqual(selfPosition, this.position);
        }
        cycleConditions(cellsExists, whileIndex, index) {//Условие по которому цыкал продолжает выполнятся в getWhereCanMoves
            return cellsExists;
        }

        checkingBeforeMove(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {//Проверка на возможность хода на клетку
            if (objSelfFigure.color != whoseMove)
                throw new Error('Its not your turn now');
            let cell = this.cellsForMove.find((item, index, arr) => _.isEqual(item, positionNewCells));//Поиск разрешенных ходов 
            if (!_.isUndefined(cell)) {
                let king = arrPieces.find(item => (item.color == whoseMove) && item.type == 'king');//Поиск короля
                let cloneObjSelfFigure = _.cloneDeep(objSelfFigure);
                let figureSamePositions = arrPieces.find((item) => _.isEqual(item.position, cell));//
                if (!_.isUndefined(figureSamePositions))
                    _.remove(arrPieces, figureSamePositions);
                objSelfFigure.position = cell;
                arrPieces.forEach((item) => item.getWhereCanMoves(arrPieces));//Обновление возможных ходов
                king.checkSafetyCell(king, arrPieces, king.position);//Проверка исчез ли шах
                objSelfFigure.position = cloneObjSelfFigure.position;
                if (!_.isUndefined(figureSamePositions))
                    arrPieces.push(figureSamePositions);
                if (ChessPieces.checkToKing) { //Если после хода шах не исчез то ошибка
                    arrPieces.forEach((item, index, arr) => item.getWhereCanMoves(arrPieces));//Обновление возможных ходов
                    throw new Error('You are a check you have to close or leave');
                }
                let figureToCell = arrPieces.find((item, index, arr) => _.isEqual(item.position, cell));//Поиск фигуру на клетке
                if (!_.isUndefined(figureToCell)) {
                    if (figureToCell.color != whoseMove) {
                        eventNewCells.target.remove();
                        _.remove(arrPieces, figureToCell);
                    }
                    else throw new Error('You cant cut down your figure');
                }
                return cell;
            }
            throw new Error('The figure cannot move to the western position');
        }

        move(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {
            let doomSelfFigure = document.querySelector('.selected');
            let cell = this.checkingBeforeMove(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells);
            eventNewCells.currentTarget.append(doomSelfFigure);//Перемещение
            //#region properis objSelfFigure
            _.remove(arrPieces, objSelfFigure);
            objSelfFigure.position = cell;
            ++objSelfFigure.strokeNumberMoves;//Добавление 1 к сделанных ходо этой фигуры
            arrPieces.push(objSelfFigure);//Добавление новой фигуры в массив
            arrPieces.forEach((item, index, arr) => item.getWhereCanMoves(arrPieces));
            //#endregion

        }
    }

    //#region  Chess

    class Pawns extends ChessPieces {


        constructor(color, { collum, row }) {
            super(color, { collum, row })
            this.type = 'pawns';
        }

        getUrl() {
            return this.color == 'white' ? 'whitePawn.png' : 'blackPawn.png';
        }

        getDirection(index, selfPosition) {
            if (this.color == 'white')
                selfPosition.collum++;
            else
                selfPosition.collum--;

            switch (index) {
                case 1: {
                    return selfPosition.row;
                }
                case 2: {
                    return selfPosition.row++;
                }
                case 3: {
                    return selfPosition.row--;
                }
            }


        }
        checkForAddToArr(selfPosition, whileIndex, roadCells) {
            let figureFront = _.isUndefined(roadCells);
            if ((selfPosition.row == this.position.row) && (figureFront)) {//Если мы двигаемся по горизонтали, то на нашем пути не должно быть других фигур
                if (this.strokeNumberMoves == 0)//Если это первый ход пешкой, то она может пойти на 2 клетки
                    return !_.isEqual(selfPosition, this.position);
                else if (whileIndex <= 1)//Если нет, то не больше 1 
                    return !_.isEqual(selfPosition, this.position);
            }
            else if ((selfPosition.row != this.position.row) && (!figureFront) && (whileIndex <= 1)) //Если мы двигаемся не только, то на нашем пути должна быть фигура не дальше 1 клетки 
                return !_.isEqual(selfPosition, this.position);
            return false;
        }

        cycleConditions(cellsExists, whileIndex, index) {
            return whileIndex < 2;
        }
    }

    class Elephant extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {
            return this.color == 'white' ? 'whiteElephant.png' : 'blackElephant.png';
        }

        getDirection(index, selfPosition, roadCells) {
            switch (index) {
                case 1: {
                    return selfPosition.collum--, selfPosition.row--;
                }
                case 2: {
                    return selfPosition.collum++, selfPosition.row++;
                }
                case 3: {
                    return selfPosition.collum--, selfPosition.row++;
                }
                case 4: {
                    return selfPosition.collum++, selfPosition.row--;
                }

            }
        }
    }

    class Rook extends ChessPieces {

        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteRook.png' : 'blackRook.png';
        }

        getDirection(index, selfPosition, roadCells) {
            switch (index) {
                case 1: {
                    return selfPosition.collum, selfPosition.row--;
                }
                case 2: {
                    return selfPosition.collum, selfPosition.row++;
                }
                case 3: {
                    return selfPosition.collum--, selfPosition.row;
                }
                case 4: {
                    return selfPosition.collum++, selfPosition.row;
                }

            }
        }

    }

    class Horse extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
            this.numberOfChecks = 8;
        }

        getUrl() {

            return this.color == 'white' ? 'whiteHorse.png' : 'blackHorse.png';
        }

        getDirection(index, selfPosition, roadCells) {
            if (range.between(1, 2, index))
                selfPosition.collum += 2;
            else if (range.between(3, 4, index))
                selfPosition.collum -= 2;
            else if (range.between(5, 6, index))
                selfPosition.row += 2;
            else if (range.between(7, 8, index))
                selfPosition.row -= 2;

            switch (true) {
                case index == 1 || index == 4: {
                    return selfPosition.row--;
                }
                case index == 2 || index == 3: {
                    return selfPosition.row++;
                }
                case index == 5 || index == 7: {
                    return selfPosition.collum--;
                }
                case index == 6 || index == 8: {
                    return selfPosition.collum++;
                }
            }
        }

        cycleConditions(cellsExists, whileIndex, index) {
            return whileIndex < 1;
        }
    }

    class Queen extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
            this.numberOfChecks = 8;
        }
        getUrl() {
            return this.color == 'white' ? 'whiteQueen.png' : 'blackQueen.png';
        }

        getDirection(index, selfPosition, roadCells) {
            switch (index) {
                case 1: {
                    return selfPosition.collum--, selfPosition.row--;
                }
                case 2: {
                    return selfPosition.collum++, selfPosition.row++;
                }
                case 3: {
                    return selfPosition.collum--, selfPosition.row++;
                }
                case 4: {
                    return selfPosition.collum++, selfPosition.row--;
                }
                case 5: {
                    return selfPosition.collum, selfPosition.row--;
                }
                case 6: {
                    return selfPosition.collum, selfPosition.row++;
                }
                case 7: {
                    return selfPosition.collum--, selfPosition.row;
                }
                case 8: {
                    return selfPosition.collum++, selfPosition.row;
                }

            }
        }

    }

    class King extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row });
            this.numberOfChecks = 8;
            this.type = 'king';
        }

        getUrl() {
            return this.color == 'white' ? 'whiteKing.png' : 'blackKing.png';
        }

        getDirection(index, selfPosition, roadCells) {
            switch (index) {
                case 1: {
                    return selfPosition.collum--, selfPosition.row--;
                }
                case 2: {
                    return selfPosition.collum--, selfPosition.row++;
                }
                case 3: {
                    return selfPosition.collum--, selfPosition.row;
                }
                case 4: {
                    return selfPosition.collum++, selfPosition.row--;
                }
                case 5: {
                    return selfPosition.collum++, selfPosition.row++;
                }
                case 6: {
                    return selfPosition.collum++, selfPosition.row;
                }
                case 7: {
                    return selfPosition.collum, selfPosition.row++;
                }
                case 8: {
                    return selfPosition.collum, selfPosition.row--;
                }
            }
        }

        checkForAddToArr(selfPosition, whileIndex, roadCells) {
            if (this.strokeNumberMoves == 0) {
                return !_.isEqual(selfPosition, this.position);
            }
            else if (whileIndex == 1) return !_.isEqual(selfPosition, this.position);
        }

        cycleConditions(cellsExists, whileIndex, index) {
            return whileIndex < 5 && range.between(7, 8, index);
        }

        checkingBeforeMove(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {
            if (objSelfFigure.color != whoseMove)
                throw new Error('Its not your turn now');

            let cell = this.cellsForMove.find((item, index, arr) => _.isEqual(item, positionNewCells))//Поиск разрешенных ходов 
            if (!_.isUndefined(cell)) {

                {
                    let varnishingResult = this.varnishing(objSelfFigure, positionNewCells, arrPieces);
                    if (!_.isUndefined(varnishingResult))
                        return varnishingResult;
                }//Проверка на лакировку
                this.checkSafetyCell(objSelfFigure, arrPieces, cell);//Проверка на безопасность клетки
                this.checkSafetyCell(objSelfFigure, arrPieces, objSelfFigure.position);
                let figureToCell = arrPieces.find((item, index, arr) => _.isEqual(item.position, cell))//Поиск фигуру на клетке
                if (!_.isUndefined(figureToCell)) {
                    if (figureToCell.color != whoseMove) {
                        eventNewCells.target.remove();
                        _.remove(arrPieces, figureToCell);
                    }
                    else throw new Error('You cant cut down your figure');
                }
                return { varnishing: false, cell: cell };
            }
            throw new Error('The figure cannot move to the western position');
        }

        move(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {
            let cell = this.checkingBeforeMove(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells);
            if (!cell.varnishing) {
                let doomSelfFigure = document.querySelector('.selected');
                eventNewCells.currentTarget.append(doomSelfFigure);//Перемещение
            }
            _.remove(arrPieces, objSelfFigure);
            objSelfFigure.position = cell.cell;
            ++objSelfFigure.strokeNumberMoves;//Добавление 1 к сделанных ходо этой фигуры
            arrPieces.push(objSelfFigure);//Добавление новой фигуры в массив
            arrPieces.forEach((item, index, arr) => item.getWhereCanMoves(arrPieces));

        }

        varnishing(objSelfFigure, positionNewCells, arrPieces) {//Проверка на лакировку
            if (objSelfFigure.strokeNumberMoves == 0) {
                let row;
                let doomCellRook;
                if (positionNewCells.row > objSelfFigure.position.row + 1)
                    row = 8;
                else if (positionNewCells.row < objSelfFigure.position.row - 1)
                    row = 1;
                doomCellRook = document.getElementById(`[${objSelfFigure.position.collum},${row}]`);
                if (!_.isNull(doomCellRook)) {
                    let rookObj = arrPieces.find((item, index, arr) => _.isEqual(item.position, { collum: objSelfFigure.position.collum, row: row }));
                    if (rookObj.strokeNumberMoves == 0) {
                        let _row = row;
                        while (_row != objSelfFigure.position.row) {//Проверка на атаки клеток для лакировки 
                            if (_row > objSelfFigure.position.row)
                                --_row;
                            else
                                ++row;
                            arrPieces.some(function (item, index, arr) {
                                item.cellsForMove.forEach(function (ite, inde, array) {
                                    if (item.color != objSelfFigure.color && _.isEqual(ite, { collum: objSelfFigure.position.collum, row: _row })) {
                                        throw new Error('Cant varnishing');
                                    }
                                })
                            });
                        }
                        let positionForRook = { collum: objSelfFigure.position.collum, row: row == 8 ? 6 : 4 }
                        let positionForKing = { collum: objSelfFigure.position.collum, row: row == 8 ? 7 : 3 }
                        let spawner = new PiecesSpawner();
                        doomCellRook.firstChild.remove();
                        document.querySelector(`.selected`).remove();
                        spawner.spawn(objSelfFigure.color, _.assignIn(positionForRook, { step: 1 }), 1, new FactoryRook())
                        spawner.spawn(objSelfFigure.color, _.assignIn(positionForKing, { step: 1 }), 1, new FactoryKing())
                        //#region properties rook
                        _.remove(arrPieces, rookObj);
                        rookObj.position = positionForRook;
                        objSelfFigure.position = positionForKing;
                        ++rookObj.strokeNumberMoves;
                        arrPieces.push(rookObj);
                        //#endregion
                        return { varnishing: true, cell: positionForKing }

                    }
                }

            }
        }
        checkSafetyCell(objSelfFigure, arrPieces, cell) {//Проверка на безопасность клетки
            ChessPieces.checkToKing = false;
            arrPieces.forEach(function (item, index, arr) {
                if (item.color != objSelfFigure.color) {
                    if (item.type == 'pawns') {//Проверка для пешек
                        let _itemCollum;
                        if (item.color == 'white')
                            _itemCollum = item.position.collum + 1;
                        else
                            _itemCollum = item.position.collum - 1;
                        if ((_.isEqual(cell, { collum: _itemCollum, row: item.position.row - 1 }) || _.isEqual(cell, { collum: _itemCollum, row: item.position.row + 1 }))) {
                            if (_.isEqual(objSelfFigure.position, cell) && !ChessPieces.checkToKing)
                                ChessPieces.checkToKing = true;
                            else
                                throw new Error('The cells is under attack');
                        }
                    }
                    else if (item.cellsForMove.some((element) => { return _.isEqual(element, cell) })) {//Для остальных
                        if (_.isEqual(objSelfFigure.position, cell))
                            ChessPieces.checkToKing = true;
                        else
                            throw new Error('The cells is under attack');
                    }


                }
            })
        }


    }
    //#endregion


    class PiecesSpawner {

        constructor() {

            this.pathChessSprites = './sprites/chess_pieces'
            this.arrPieces = [];
        }

        spawn(color, { collum, row, step }, quantity, name) {

            this._checkingBeforeSpawning({ collum, row, step }, quantity);
            let currenStep = 0;
            let chess_pice;
            for (let i = 0; i < quantity; i++) {
                if (quantity > 2)
                    chess_pice = name.create(color, { collum, row: i + 1, step, currenStep });
                else
                    chess_pice = name.create(color, { collum, row: row + currenStep, step, currenStep });
                this.arrPieces.push(chess_pice);
                currenStep = this._inntrChessPiceToHtml({ collum, row, currenStep, step }, chess_pice.getUrl(), color);
            }
        }
        _checkingBeforeSpawning({ collum, row, step }, quantity) {
            if (row + quantity > 9)
                throw Error("There are not enough cells in a row to accommodate so many chess pice ");
        }

        _inntrChessPiceToHtml({ collum, row, currenStep, step }, urlName, color) {
            document.getElementById(`[${collum},${row + currenStep}]`).innerHTML += `<div class='chess_img ${color}'  id=${urlName.substring(0, urlName.indexOf('.'))} style='background-image:url(${this.pathChessSprites}/${urlName});' draggable ='true'></div>`;
            return currenStep + step;
        }

    }

    //#region  Factorys
    class FactoryPawn {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new Pawns(color, { collum, row, step, currenStep });
        }
    }

    class FactoryRook {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new Rook(color, { collum, row, step, currenStep });
        }
    }

    class FactoryHorse {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new Horse(color, { collum, row, step, currenStep });
        }
    }

    class FactoryElephant {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new Elephant(color, { collum, row, step, currenStep });
        }
    }

    class FactoryQueen {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new Queen(color, { collum, row, step, currenStep });
        }
    }

    class FactoryKing {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new King(color, { collum, row, step, currenStep });
        }
    }

    //#endregion

    return {
        ChessPieces: ChessPieces,
        Pawns: Pawns,
        Rook: Rook,
        Elephant: Elephant,
        Horse: Horse,
        Queen: Queen,
        King: King,
        PiecesSpawner: PiecesSpawner,
        FactoryPawn: FactoryPawn,
        FactoryRook: FactoryRook,
        FactoryHorse: FactoryHorse,
        FactoryElephant: FactoryElephant,
        FactoryQueen: FactoryQueen,
        FactoryKing: FactoryKing
    };

});
