define(['../../node_modules/lodash/lodash.min',

], function (_) {

    class ChessPieces {

        constructor(color, { collum, row }) {
            this.color = color;
            this.position = { collum, row };
            this.cellsForMove = [];
            this.numberOfChecks = 4;//Количество условий для проверки
            this.strokeNumberMoves = 0;//Количество сделанных ходов вибронной фигурой
        }

        position() {
            return this.position;
        }
        getDirection(index, selfPosition) { }

        checkingСellEnemy() {

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
                    roadCells = document.getElementById(`[${selfPosition.collum},${selfPosition.row}]`);//Получение клетки на которой мы находимся 
                    if (!_.isNull(roadCells)) {//Существует ли такая клетка

                        if (!_.isNull(roadCells.firstChild)) {//Есть ли на этой клетке фигура 
                            addToArray(selfPosition, whileIndex, roadCells);
                            break;
                        }
                        addToArray(selfPosition, whileIndex, roadCells);

                    }
                    else break;



                } while (this.cycleConditions(roadCells, whileIndex) || whileIndex > 200)
            }
        }

        checkForAddToArr(selfPosition, whileIndex) {
            return !_.isEqual(selfPosition, this.position);
        }
        cycleConditions(roadCells, whileIndex) {
            return !_.isNull(roadCells)
        }

        move(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {

            if (objSelfFigure.color != whoseMove) {
                console.log('Its not your turn now');
                return false;
            }

            let doomSelfFigure = document.querySelector('.selected')
            let cell = this.cellsForMove.find(function (item, index, arr) {
                return _.isEqual(item, positionNewCells);
            })//Поиск разрешенных ходов 
            console.log(this.cellsForMove);
            if (!_.isUndefined(cell)) {
                let figureToCell = arrPieces.find(function (item, index, arr) {
                    return _.isEqual(item.position, cell);
                })//Поиск фигуру на клетке

                if (!_.isUndefined(figureToCell)) {
                    if (figureToCell.color != whoseMove) {
                        eventNewCells.target.remove();
                        _.remove(arrPieces, figureToCell)
                    }
                    else return false;


                }
                eventNewCells.currentTarget.append(doomSelfFigure)
                objSelfFigure.position = cell;
                ++objSelfFigure.strokeNumberMoves;//Добавление 1 к сделанных ходо этой фигуры
                arrPieces.push(objSelfFigure)//Добавление новой фигуры в массив
                arrPieces.forEach((item, index, arr) => {
                    item.checkingСellEnemy()
                });

                return true;
            }
            return false;



        }

    }


    class Pawns extends ChessPieces {


        constructor(color, { collum, row }) {
            super(color, { collum, row })


        }

        getUrl() {
            return this.color == 'white' ? 'whitePawn.png' : 'blackPawn.png'
        }

        getDirection(index, selfPosition) {
            if (this.color == 'white')
                selfPosition.collum--;
            else {
                selfPosition.collum++
            }
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
            let figureFront = _.isNull(roadCells.firstChild);
            if ((selfPosition.row == this.position.row) && (figureFront)) {//Если мы двигаемся по горизонтали, то на нашем пути не должно быть других фигур
                if (this.strokeNumberMoves == 0)//Если это первый ход пешкой, то она может пойти на 2 клетки
                    return !_.isEqual(selfPosition, this.position)
                else if (whileIndex <= 1)//Если нет, то не больше 1 
                    return !_.isEqual(selfPosition, this.position);
            }
            else if ((selfPosition.row != this.position.row) && (!figureFront) && (whileIndex <= 1)) //Если мы двигаемся не только, то на нашем пути должна быть фигура не дальше 1 клетки 
                return !_.isEqual(selfPosition, this.position);


            return false;




        }

        cycleConditions(roadCells, whileIndex) {
            return whileIndex < 2;

        }


    }
    //#region  Chess

    class Rook extends ChessPieces {

        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteRook.png' : 'blackRook.png'
        }
    }


    class Elephant extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteElephant.png' : 'blackElephant.png'
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

    class Horse extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteHorse.png' : 'blackHorse.png'
        }
    }


    class Queen extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteQueen.png' : 'blackQueen.png'
        }
    }

    class King extends ChessPieces {
        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }

        getUrl() {

            return this.color == 'white' ? 'whiteKing.png' : 'blackKing.png'
        }
    }
    //#endregion

    class PiecesSpawner {

        constructor(cells, color) {

            this._cells = cells;
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

    return {
        ChessPieces: ChessPieces,
        Pawns: Pawns,
        Rook: Rook,
        Elephant: Elephant,
        Horse: Horse,
        Queen: Queen,
        King: King,
        PiecesSpawner: PiecesSpawner

    }

});
