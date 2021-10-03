define(['../../node_modules/lodash/lodash.min',

], function (_) {

    class ChessPieces {

        constructor(color, { collum, row }) {
            this.color = color;
            this.position = { collum, row };
            this.cellsForMove = [];
        }

        position() {
            return this.position;
        }

        checkingСellEnemy() {
            this.cellsForMove = [];
            for (var i = 1; i < 5; i++) {
                let selfPosition = _.cloneDeep(this.position);
                let roadCells;

                do {
                    if (!_.isEqual(selfPosition, this.position)) //Проверка, чтобы не записать клетку на которой уже стоит фигура
                        this.cellsForMove.push(_.cloneDeep(selfPosition));

                    this.getDirection(i, selfPosition);//Алгоритм по которому смотрим как может двигаться фигура 
                    roadCells = document.getElementById(`[${selfPosition.collum},${selfPosition.row}]`);//Получение клетки на которой мы находимся 
                    if (!_.isNull(roadCells)) {//Существует ли такая клетка
                        if (!_.isNull(roadCells.firstChild)) {//Есть ли на этой клетке фигура 
                            this.cellsForMove.push(_.cloneDeep(selfPosition));
                            break;
                        }
                    }
                    else break;



                } while (this.сheckExistCell(roadCells))
            }
        }

        getDirection(index, selfPosition) {
            switch (index) {
                case 1: {
                    return selfPosition.collum--, selfPosition.row--;
                }
                case 2: {
                    return selfPosition.collum++, selfPosition.row--;
                }
                case 3: {
                    return selfPosition.collum--, selfPosition.row++;
                }
                case 4: {
                    return selfPosition.collum++, selfPosition.row++;
                }

            }
        }

        сheckExistCell(roadCells) {
            return !_.isNull(roadCells)
        }

        checkFigureOnWay(roadCells, whoseMove, arrPieces) {
            let arrClassFigure = Array.from(roadCells.firstChild.classList);
            return arrClassFigure.includes(whoseMove)
        }

        move(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {

            if (objSelfFigure.color != whoseMove) {
                console.log('Its not your turn now');
                return false;
            }

            let doomSelfFigure = document.querySelector('.selected')
            let cell = this.cellsForMove.find(function (item, index, arr) {
                return _.isEqual(item, positionNewCells);
            })

            if (!_.isUndefined(cell)) {
                let figureToCell = arrPieces.find(function (item, index, arr) {
                    return _.isEqual(item.position, cell);
                })

                if (!_.isUndefined(figureToCell)) {
                    if (figureToCell.color != whoseMove) {
                        eventNewCells.target.remove();
                        _.remove(arrPieces, figureToCell)
                    }
                    else return false;


                }
                eventNewCells.currentTarget.append(doomSelfFigure)
                objSelfFigure.position = cell;
                arrPieces.push(objSelfFigure)//Добавление новой фигуры в массив
                arrPieces.forEach((item, index, arr) => {
                    item.checkingСellEnemy()
                });
                return true;
            }
            return false;



        }

    }

    //#region  Chess
    class Pawns extends ChessPieces {


        constructor(color, { collum, row }) {
            super(color, { collum, row })
            this.numberMovesSelfPawn = 0;
        }


        getUrl() {
            return this.color == 'white' ? 'whitePawn.png' : 'blackPawn.png'
        }

        possibleFigureMove(positionNewCells, startPosition) {
            this.numberMovesSelfPawn++

            let quantityAheadСell = Math.abs(startPosition.collum - positionNewCells.collum)
            if (startPosition.row != positionNewCells.row)
                return false;
            else if (this.numberMovesSelfPawn <= 2 && quantityAheadСell <= 2)
                return true;
            else if (quantityAheadСell <= 1)
                return true
            console.log('The pawn moves 2 squares only for the first time')
            return false;

        }

    }


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
