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

                this._piecesSpawner = new chessClass.PiecesSpawner(this.cells, color);
                if (this._color == 'white')
                    this._drawChessPices('black', 'white')
                else {

                    this._drawChessPices('black', 'white')
                }


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
                    if (collum % 2 == 1) {
                        className1 = 'cells_white'
                        className2 = 'cells_black'

                    }
                    else {
                        className1 = 'cells_black'
                        className2 = 'cells_white'
                    }
                    this._mainDiv.innerHTML += `<div class="${className1}"  id='[${collumId},${rowsId++}]'></div><div class="${className2}"  id='[${collumId},${rowsId++}]'></div>`;
                }
                return collumId;

            }.bind(this);
            //#endregion

            if (this._color == 'black') {
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
        _drawChessPices(selfColor, frandColor) {
            [{ color: frandColor, collum: 1 }, { color: selfColor, collum: 6 }].forEach((item, i, arr) => {

                this._piecesSpawner.spawn(item.color, { collum: item.collum + 1, row: 1, step: 1 }, 8, new FactoryPawn());
                if (i > 0)
                    item.collum = 8;
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 1, step: 7 }, 2, new FactoryRook());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 2, step: 5 }, 2, new FactoryHorse());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 3, step: 3 }, 2, new FactoryElephant());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 4, step: 1 }, 1, new FactoryQueen());
                this._piecesSpawner.spawn(item.color, { collum: item.collum, row: 5, step: 1 }, 1, new FactoryKing());

            })
        }//Создание фигур


    }

    class Game extends GameStarter {

        constructor(color) {
            super(color)
            this._whoseMove = 'white';
            this._createEventsDragovers();
            this._piecesSpawner.arrPieces.forEach((item, index, arr) => {
                item.checkingСellEnemy()
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
                        let copySelfFigure = _.cloneDeep(selfFigure);//Копия фигуры 
                        let positionNewCells = convertPositionToObject(eventCellsForNewPosition.currentTarget.id);//Позиция куда идет фигура 
                        _.remove(this._piecesSpawner.arrPieces, selfFigure)
                        eventCellsForNewPosition = selfFigure.move(eventCellsForNewPosition, selfFigure, this._whoseMove, this._piecesSpawner.arrPieces, positionNewCells);//Перемещение фигуры 

                        if (eventCellsForNewPosition) {//Проверка дошла ли фигура 
                            this._whoseMove = this._whoseMove == 'white' ? 'black' : 'white'//Смена цвет хода   
                            return;
                        }
                        this._piecesSpawner.arrPieces.push(copySelfFigure);//Возврат старой фигуры в массив

                        throw Error('Chess piece cant reach the selected position')
                    }
                    else throw Error('The selected figure was not found among the other figures')

                })

            }
            //#endregion

        }


    }

    //#region  Factorys
    class FactoryPawn {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.Pawns(color, { collum, row, step, currenStep });
        }
    }

    class FactoryRook {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.Rook(color, { collum, row, step, currenStep });
        }
    }

    class FactoryHorse {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.Horse(color, { collum, row, step, currenStep });
        }
    }

    class FactoryElephant {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.Elephant(color, { collum, row, step, currenStep });
        }
    }

    class FactoryQueen {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.Queen(color, { collum, row, step, currenStep });
        }
    }

    class FactoryKing {
        constructor() { }

        create(color, { collum, row, step, currenStep }) {
            return new chessClass.King(color, { collum, row, step, currenStep });
        }
    }

    //#endregion

    return () => { let game = new Game("white") };


});
