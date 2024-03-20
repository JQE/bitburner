export class Deque {
    #capacity = 0; // The maximum length.
    #length = 0; // The actual number of items in the queue
    #front = 0; // The index of the "head" where data is read from the queue.
    #deleted = 0; // The number of "dead" items in the queue. These occur when items are deleted by index. They are bad.
    #elements; // An inner array to store the data.
    #index = new Map(); // A hash table to track items by ID. Try not to delete items using this, it's bad.

    // Create a new queue with a specific capacity.
    constructor(capacity) {
        this.#capacity = capacity;
        this.#elements = new Array(capacity);
    }

    // You can also convert arrays.
    static fromArray(array, overallocation = 0) {
        const result = new Deque(array.length + overallocation);
        array.forEach((item) => result.push(item));
        return result;
    }

    // Deleted items don't count towards length, but they still take up space in the array until they can be cleared.
    // Seriously, don't use the delete function unless it's absolutely necessary.
    get size() {
        return this.#length - this.#deleted;
    }

    isEmpty() {
        return this.#length - this.#deleted === 0;
    }

    // Again, "deleted" items still count towards this. Use caution.
    isFull() {
        return this.#length === this.#capacity;
    }

    // The "tail" where data is typically written to.
    // Unlike the front, which points at the first piece of data, this point at the first empty slot.
    get #back() {
        return (this.#front + this.#length) % this.#capacity;
    }

    // Push a new element into the queue.
    push(value) {
        if (this.isFull()) {
            throw new Error("The deque is full. You cannot add more items.");
        }
        this.#elements[this.#back] = value;
        this.#index.set(value.id, this.#back);
        ++this.#length;
    }

    // Pop an item off the back of the queue.
    pop() {
        while (!this.isEmpty()) {
            --this.#length;
            const item = this.#elements[this.#back];
            this.#elements[this.#back] = undefined; // Free up the item for garbage collection.
            this.#index.delete(item.id); // Don't confuse index.delete() with this.delete()
            if (item.status !== "deleted")
                return item; // Clear any "deleted" items we encounter.
            else --this.#deleted; // If you needed another reason to avoid deleting by ID, this breaks the O(1) time complexity.
        }
        throw new Error("The deque is empty. You cannot delete any items.");
    }

    // Shift an item off the front of the queue. This is the main method for accessing data.
    shift() {
        while (!this.isEmpty()) {
            // Our pointer already knows exactly where the front of the queue is. This is much faster than the array equivalent.
            const item = this.#elements[this.#front];
            this.#elements[this.#front] = undefined;
            this.#index.delete(item.id);

            // Move the head up and wrap around if we reach the end of the array. This is essentially a circular buffer.
            this.#front = (this.#front + 1) % this.#capacity;
            --this.#length;
            if (item.status !== "deleted") return item;
            else --this.#deleted;
        }
        throw new Error("The deque is empty. You cannot delete any items.");
    }

    // Place an item at the front of the queue. Slightly slower than pushing, but still faster than doing it on an array.
    unshift(value) {
        if (this.isFull()) {
            throw new Error("The deque is full. You cannot add more items.");
        }
        this.#front = (this.#front - 1 + this.#capacity) % this.#capacity;
        this.#elements[this.#front] = value;
        this.#index.set(value.id, this.#front);
        ++this.#length;
    }

    // Peeking at the front is pretty quick, since the head is already looking at it. We just have to clear those pesky "deleted" items first.
    peekFront() {
        if (this.isEmpty()) {
            throw new Error("The deque is empty. You cannot peek.");
        }

        while (this.#elements[this.#front].status === "deleted") {
            this.#index.delete(this.#elements[this.#front]?.id);
            this.#elements[this.#front] = undefined;
            this.#front = (this.#front + 1) % this.#capacity;
            --this.#deleted;
            --this.#length;

            if (this.isEmpty()) {
                throw new Error("The deque is empty. You cannot peek.");
            }
        }
        return this.#elements[this.#front];
    }

    // Peeking at the back is ever so slightly slower, since we need to recalculate the pointer.
    // It's a tradeoff for the faster push function, and it's a very slight difference either way.
    peekBack() {
        if (this.isEmpty()) {
            throw new Error("The deque is empty. You cannot peek.");
        }

        let back = (this.#front + this.#length - 1) % this.#capacity;
        while (this.#elements[back].status === "deleted") {
            this.#index.delete(this.#elements[back].id);
            this.#elements[back] = undefined;
            back = (back - 1 + this.#capacity) % this.#capacity;
            --this.#deleted;
            --this.#length;

            if (this.isEmpty()) {
                throw new Error("The deque is empty. You cannot peek.");
            }
        }

        return this.#elements[back];
    }

    // Fill the queue with a single value.
    fill(value) {
        while (!this.isFull()) {
            this.push(value);
        }
    }

    // Empty the whole queue.
    clear() {
        while (!this.isEmpty()) {
            this.pop();
        }
    }

    // Check if an ID exists.
    exists(id) {
        return this.#index.has(id);
    }

    // Fetch an item by ID
    get(id) {
        let pos = this.#index.get(id);
        return pos !== undefined ? this.#elements[pos] : undefined;
    }

    // DON'T
    delete(id) {
        let item = this.get(id);
        if (item !== undefined) {
            item.status = "deleted";
            ++this.#deleted;
            return item;
        } else {
            throw new Error("Item not found in the deque.");
        }
    }
}
