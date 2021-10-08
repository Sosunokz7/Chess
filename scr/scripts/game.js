define([
    './../../node_modules/lodash/lodash.min',
    './chess_classes',
    './lib/convertPositionToObject',

], function (_, chessClass, convertPositionToObject) {

    class GameStarter {

        constructor(color) {
            if (this.possibleСolors.includes(color)) {
                this._color = color;
                this._drawCells();
                this._piecesSpawner = new chessClass.PiecesSpawner();
                this._drawChessPices()

            }
            else
                throw Error(`The player's color is only black or white but not ${color}`);
        }
        //#region  properties
        get _mainDiv() {
            return document.querySelector('.main');
        }

        get possibleСolors() {
            return ['black', 'white'];
        }

        get color() {
            return this._color;
        }

        static get chessBoard() {
            return this._piecesSpawner;
        }

        //#endregion

        _drawCells() {
            //#region  function spawner
            const spawner = function (collumId, collum) {
                let _collum;
                let rowsId = 1;
                let classes = ['cells_white', 'cells_black'];
                let className1, className2;
                if (this._color == 'black') {
                    _collum = collum + 1;
                    collumId++
                }
                else {
                    _collum = collum - 1;
                    collumId--
                }

                this._mainDiv.innerHTML += `<div class="cells_coordinat"><span class='cells_number'>${_collum}<span></div>`
                for (let row = 0; row < 4; row++) {
                    let idClass = collum % 2;
                    if (this._color == 'black') {
                        className1 = classes[idClass];
                        className2 = classes[Math.abs(idClass - 1)];
                    }
                    else {
                        className1 = classes[Math.abs(idClass - 1)];
                        className2 = classes[idClass];
                    }
                    this._mainDiv.innerHTML += `<div class="${className1}"  id='[${collumId},${rowsId++}]'></div><div class="${className2}"  id='[${collumId},${rowsId++}]'></div>`;
                }
                return collumId;

            }.bind(this);
            //#endregion

            if (this.color == 'black') {
                let collumId = 0;
                for (let collum = 0; collum < 8; collum++)
                    collumId = spawner(collumId, collum)
            }
            else {
                let collumId = 9;
                for (let collum = 9; collum > 1; collum--)
                    collumId = spawner(collumId, collum)

            }
            this.cells = document.querySelectorAll('.cells_black,.cells_white');
        }//Рисование клеток
        _drawChessPices() {
            [{ color: 'white', collum: 1 }, { color:'black' , collum: 6 }].forEach((item, i, arr) => {

                this._piecesSpawner.spawn(item.color, { collum: item.collum + 1, row: 1, step: 1 }, 8, new chessClass.FactoryPawn());
                if (i > 0)
                    item.collum = 8;
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 1, step: 7 }, 2, new chessClass.FactoryRook());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 2, step: 5 }, 2, new chessClass.FactoryHorse());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 3, step: 3 }, 2, new chessClass.FactoryElephant());
                let rowForQueen, rowForKing;
                if (this.color == 'white')
                    rowForQueen = 4, rowForKing = 5
                else
                    rowForQueen = 5, rowForKing = 4
                    
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: rowForQueen, step: 1 }, 1, new chessClass.FactoryQueen());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: rowForKing, step: 1 }, 1, new chessClass.FactoryKing());

            })
        }//Создание фигур
    }

    class Game extends GameStarter {

        constructor(color) {
            super(color)
            this._whoseMove = 'white';
            this._createEventsDragovers();
            this._piecesSpawner.arrPieces.forEach((item, index, arr) => {
                item.getWhereCanMoves()
            });
        }

        _createEventsDragovers() {
            //#region  drag event for FIGURE
            let ls = document.querySelectorAll('.chess_img');
            for (const value of ls) {//Для фигур

                value.addEventListener('dragstart', (event) => {
                    console.clear();
                    event.target.classList.add('selected');
                });

                value.addEventListener('dragend', (event) => {
                    event.target.classList.remove('selected');
                });
            }
            //#endregion        
            //#region  drag event for CELLS
            for (const value of this.cells) {//Для клеток 

                value.addEventListener('dragstart', (event) => {
                    event.target.parentElement.classList.add('positionBeforeMoving');
                })

                value.addEventListener('dragend', (event) => {
                    document.querySelector('.positionBeforeMoving').classList.remove('positionBeforeMoving');

                })
                value.addEventListener('dragover', (event) => {
                    event.preventDefault();
                })

                value.addEventListener('drop', (eventCellsForNewPosition) => {
                    let startingPosition = document.querySelector('.positionBeforeMoving');//Позция до перемещение   
                    let positionBeforeMoving = convertPositionToObject(startingPosition.id);

                    let selfFigure = this._piecesSpawner.arrPieces.find((item, index, arr) => {
                        return _.isEqual(item.position, positionBeforeMoving)
                    });//Поиск перемещяемой фигуры 

                    if (!_.isUndefined(selfFigure)) {
                        let positionNewCells = convertPositionToObject(eventCellsForNewPosition.currentTarget.id);//Позиция куда идет фигура 
                        selfFigure.move(eventCellsForNewPosition, selfFigure, this._whoseMove, this._piecesSpawner.arrPieces, positionNewCells);//Перемещение фигуры 
                        this._whoseMove = this._whoseMove == 'white' ? 'black' : 'white'

                    }
                    else throw Error('The selected figure was not found among the other figures')

                })

            }
            //#endregion
        }

    }

    return () => { let game = new Game("white") };

});
