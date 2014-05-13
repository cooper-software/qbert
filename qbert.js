(function ()
{

'use strict';

var Block = function (element, pixel_size, max_width)
{
    this.element = element
    this.max_width = max_width
    this.set_pixel_size(pixel_size)
}
Block.prototype = 
{
    set_position: function (x, y)
    {
        this.element.style.left = (x * this.pixel_size) + 'px'
        this.element.style.top = (y * this.pixel_size) + 'px'
    },
    
    set_pixel_size: function (pixel_size, max_width)
    {
        this.pixel_size = pixel_size
        this.max_width = max_width
        this.width = Math.min(this.max_width, parseInt(this.element.dataset.blockWidth || 1))
        this.height = parseInt(this.element.dataset.blockHeight || 1)
        this.element.style.width = (pixel_size * this.width) + 'px'
        this.element.style.height = (pixel_size * this.height) + 'px'
    }
}

var BlockRow = function (max_width, default_height)
{
    this.height = 0
    this.width = max_width
    this.grid = []
    this.x = 0
    this.y = 0
    
    this.set_height(default_height)
}

BlockRow.prototype = 
{
    fit: function (width, height)
    {
        var old_height = this.height
        
        if (height > this.height)
        {
            this.set_height(height)
        }
        
        if (width > this.width)
        {
            width = this.width
        }
        
        var pos = this.find_gap(width, height)
        
        if (pos)
        {
            this.fill(pos.x, pos.y, width, height)
                return pos
        }
        else
        {
            this.set_height(old_height)
            return null
        }
    },
    
    find_gap: function (width, height)
    {
        var x = this.width, y = this.height
        
        this.grid.every(function (row, i)
        {
            if (i + height > this.height)
            {
                return false
            }
            
            var gap_x = -1,
                gap_width = 0
                
            row.some(function (is_full, j)
            {
                if (is_full)
                {
                    gap_x = -1
                    gap_width = 0
                }
                else
                {
                    if (gap_width == 0)
                    {
                        gap_x = j
                    }
                    
                    gap_width++
                    
                    if (gap_width >= width)
                    {
                        return true
                    }
                }
                
                return false
            })
            
            if (-1 < gap_x && gap_x < x && gap_width >= width)
            {
                x = gap_x
                y = i
            }
            
            return true
            
        }, this)
        
        if (x < this.width && y < this.height)
        {
            return {
                x: x,
                y: y
            }
        }
        else
        {
            return null
        }
    },
    
    fill: function (x, y, width, height)
    {
        x = Math.min(x, this.width - 1)
        y = Math.min(y, this.height - 1)
        width = Math.min(width, this.width - x)
        height = Math.min(height, this.height - y)
        
        for (var i = y; i < y + height; i++)
        {
            for (var j = x; j < x + width; j++)
            {
                this.grid[i][j] = 1
            }
        }
    },
    
    set_height: function (height)
    {
        if (height == this.height)
        {
            return
        }
        
        if (height < this.height)
        {
            this.grid = this.grid.slice(0, height)
        }
        else
        {
            var num_new_rows = height - this.height
            
            for (var i = 0; i < num_new_rows; i++)
            {
                this.grid.push(
                    Array.apply(null, new Array(this.width)).map(function () { return 0 })
                )
            }
        }
        
        this.height = height
    },
    
    is_empty: function ()
    {
        var sum = function (a, b) { return a + b }
        return this.grid.reduce(function (a,b) { return a + b.reduce(sum) }, 0) === 0
    }
}

var BlockCursor = function (max_width, default_row_height)
{
    this.max_width = max_width
    this.default_row_height = default_row_height
    this.rows = [ new BlockRow(this.max_width, this.default_row_height) ]
}
BlockCursor.prototype = 
{
    fit: function (width, height)
    {
        var pos = null
        
        this.rows.some(function (row, i)
        {
            pos = row.fit(width, height)
            
            if (pos)
            {
                pos.row = i
                return true
            }
        })
        
        if (!pos)
        {
            this.add_row()
            var current_row = this.current_row()
            pos = current_row.fit(width, height)
            pos.row = this.rows.length - 1
        }
        
        return {
            x: pos.x,
            y: this.rows.slice(0, pos.row).reduce(function (a, b) { return a + b.height }, 0) + pos.y
        }
    },
    
    add_row: function ()
    {
        this.rows.push(
            new BlockRow(this.max_width, this.default_row_height)
        )
    },
    
    current_row: function ()
    {
        return this.rows[this.rows.length - 1]
    }
}

var Qbert = function (element, options)
{
    this.options = {
        target_pixel_size: 187,
        target_row_height: 2
    }
    
    if (options)
    {
        Object.keys(options).forEach(function (k)
        {
            this.options[k] = options[k]
        }, this)
    }
    
    this.pixel_size = this.options.target_pixel_size
    this.element = element
    var blockNodes = this.element.querySelectorAll("[data-block-width]")
    this.blocks = Array.prototype.slice.call(blockNodes, 0).map(function (e)
    {
        return new Block(e, 0, 0)
    }, this)
    
    this.update_pixel_size()
    
    window.addEventListener('resize', this.update_pixel_size.bind(this))
}

Qbert.prototype = 
{
    update_pixel_size: function ()
    {
        var max_width = window.innerWidth
        this.columns = Math.floor(max_width / this.options.target_pixel_size)
        this.pixel_size = max_width / this.columns
        this.blocks.forEach(function (block)
        {
            block.set_pixel_size(this.pixel_size, max_width)
        }, this)
        this.layout()
    },
    
    layout: function ()
    {
        this.columns = Math.floor(window.innerWidth / this.options.target_pixel_size)
        var cursor = new BlockCursor(this.columns, this.options.target_row_height)
        this.blocks.map(function (block)
        {
            var pos = cursor.fit(block.width, block.height)
            block.set_position(pos.x, pos.y)
        })
    }
}

window.qbert = function (element_or_selector, options)
{
    if (typeof element_or_selector == "string")
    {
        element_or_selector = document.querySelector(element_or_selector)
        
        if (!element_or_selector)
        {
            return
        }
    }
    
    return new Qbert(element_or_selector, options)
}

})();