define(['../../node_modules/lodash/lodash.min'], function (_) {

    class ChessPieces {

        constructor(color, { collum, row }) {
            this.color = color;
            this.position = { collum, row };
        }

        position() {
            return this.position;
        }

        generalСheckMoves(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {

            if (objSelfFigure.color != whoseMove) {
                console.log('Its not your turn now');
                return false;
            }
            while (!_.isEqual(positionNewCells, objSelfFigure.position)){//Поход до нужной позиции 
                for (let i in objSelfFigure.position) {
                    if (objSelfFigure.position[i] < positionNewCells[i])//Если позиция фигуры меньше то + 1 
                        ++objSelfFigure.position[i];
                    else if (objSelfFigure.position[i] > positionNewCells[i])//Если позиция фигуры больше то - 1 
                        --objSelfFigure.position[i];

                }

                let roadCells = document.getElementById(`[${objSelfFigure.position.collum},${objSelfFigure.position.row}]`);//Получение клетки на которой мы находимся
                if (!_.isNull(roadCells.firstChild)) {//Есть ли на этой клетке фигура 
                    let arrClassFigure = Array.from(roadCells.firstChild.classList);
                    if (_.isEqual(positionNewCells, objSelfFigure.position) && !(arrClassFigure.includes(whoseMove))) {//Проверка на цвет фигуры и на совпадение ее позиции с нашей конечной   
                        _.remove(arrPieces, (item, index, arr) => {
                            return _.isEqual(positionNewCells, item.position);
                        });
                        eventNewCells.target.remove();
                        return true
                    }
                    console.log('You cant walk through the figures')
                    return false;

                }

            }
            return true;



        }

        move(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) {

            let doomSelfFigure = document.querySelector('.selected')
            
            if (this.generalСheckMoves(eventNewCells, objSelfFigure, whoseMove, arrPieces, positionNewCells) == false)
                return;

            eventNewCells.currentTarget.append(doomSelfFigure)
            return true;

        }


        dead() {

        }

    }

    //#region  Chess
    class Pawns extends ChessPieces {


        constructor(color, { collum, row }) {
            super(color, { collum, row })
        }


        getUrl() {

            return this.color == 'white' ? 'whitePawn.png' : 'blackPawn.png'
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
