class Snake {
    constructor(context, canvas, eventsrc=document) {
        // Parameters
        this.context = context;
        this.canvas = canvas;
        this.eventsrc = eventsrc;
        // Other configurations
        this.tiles_count = {x: 27, y: 20};
        this.tiles_size = {x: 50, y: 50}
        this.tiles_margin = {x: 4, y: 4};
        this.period = 100;
        this.keybindings = {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
        };
        this.colors = {
            background: '#181818',
            snake: '#008855',
            snake_head: '#88AA55',
            apple: '#AA2200',
        };
        // Init functions
        this.keyupFunction = (evt) => this.onKeyup(evt);
        this.keydownFunction = (evt) => this.onKeydown(evt);
        // Init variables
        this.width = null;
        this.height = null;
        this.intervalId = null;
        this.snake = null;
        this.direction = null;
        this.last_direction = null;
        this.apple = null;
        this.running = false;
    }

    init() {
        // Reset transform in case context has already been scaled
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        // Scale game to underlying context size
        this.width = this.tiles_count.x * this.tiles_size.x;
        this.height = this.tiles_count.y * this.tiles_size.y;
        this.context.scale(this.canvas.width/this.width, this.canvas.height/this.height);
        // Reset game state
        this.direction = {axis: 'x', sign: 1};
        this.last_direction = this.direction;
        this.snake = [
            {x: 12, y: 10},
            {x: 11, y: 10},
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10},
        ];
        this.relocateApple();
        this.render();
    }

    start() {
        this.eventsrc.addEventListener('keydown', this.keydownFunction);
        this.intervalId = setInterval(() => this.step(), this.period);
        this.running = true;
    }

    stop() {
        clearInterval(this.intervalId);
        this.eventsrc.removeEventListener('keydown', this.keydownFunction);
        this.running = false;
    }

    fillTile(x, y) {
        this.context.fillRect(
            this.tiles_size.x * x + this.tiles_margin.x, 
            this.tiles_size.y * y + this.tiles_margin.y, 
            this.tiles_size.x - this.tiles_margin.x * 2, 
            this.tiles_size.y - this.tiles_margin.y * 2,
        );
    }

    render() {
        // Draw background
        this.context.fillStyle = this.colors.background;
        this.context.fillRect(0, 0, this.width, this.height);
        // Draw snake
        this.snake.forEach((part, index) => {
            if(index == 0) {
                this.context.fillStyle = this.colors.snake_head;
            } else {
                this.context.fillStyle = this.colors.snake;
            }
            this.fillTile(part.x, part.y);
        });
        // Draw apple
        this.context.fillStyle = this.colors.apple;
        this.fillTile(this.apple.x, this.apple.y);
    }

    relocateApple() {
        do {
            this.apple = {
                x: Math.floor(Math.random() * this.tiles_count.x),
                y: Math.floor(Math.random() * this.tiles_count.y),
            };
        } while(this.snake.find((part) => {
            return part.x == this.apple.x && part.y == this.apple.y;
        }) != undefined);
    }

    lose() {
        this.stop();
        setTimeout(() => this.init(), 1500);
    }

    nextFrame() {
        // Calculate new position
        this.last_direction = this.direction;
        let new_position = {x: this.snake[0].x, y: this.snake[0].y};
        new_position[this.last_direction.axis] += this.last_direction.sign;
        // Check out of bounds
        if(new_position.x < 0 || new_position.x > this.tiles_count.x - 1 
            || new_position.y < 0 || new_position.y > this.tiles_count.y - 1 ) {
            this.lose()
            return;
        }
        // Check if snake is eating itself
        let eatIndex = this.snake.findIndex((part) => {
            return part.x == new_position.x && part.y == new_position.y;
        });
        if(eatIndex != -1) {
            // Should not be possible
            if(eatIndex == 0) {
                this.lose()
                return;
            }
            this.snake = this.snake.slice(0, eatIndex);
        }
        // Check whether apple is eaten
        let appleEaten = 
            new_position.x == this.apple.x && new_position.y == this.apple.y;
        // Move snake
        this.snake.unshift(new_position);
        if(appleEaten) {
            // Relocate apple if it has been eaten, snake becomes longer
            this.relocateApple();
        } else {
            // Remove trailing part of the snake, mantaining previous size
            this.snake.pop();
        }
    }

    step() {
        this.nextFrame();
        this.render();
    }

    onKeydown(evt) {
        let new_direction = null;
        switch(evt.keyCode) {
            case this.keybindings.left:
                new_direction = {axis: 'x', sign: -1};
                break;
            case this.keybindings.up:
                new_direction = {axis: 'y', sign: -1};
                break;
            case this.keybindings.right:
                new_direction = {axis: 'x', sign: 1};
                break;
            case this.keybindings.down:
                new_direction = {axis: 'y', sign: 1};
                break;
        }
        // Prevent changing to opposite direction directly (e.g. left -> right)
        if(new_direction && new_direction.axis != this.last_direction.axis) {
            this.direction = new_direction;
        }
    }
}
