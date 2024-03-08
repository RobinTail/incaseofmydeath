import { describe, test, expect } from "vitest";
import { debounce } from "./debounce.js";

describe("Debounce", () => {
  const returns: number[] = [];
  const stack: number[] = [];

  test("should not run function with the same args for specific time", () =>
    new Promise<void>((done) => {
      const fn = (n: number) => {
        stack.push(n * 2);
        return n;
      };
      const debouncedFn = debounce({
        fn,
        name: "test",
        seconds: 3,
        mapper: (n) => `${n}`,
      });

      const pusher = () => {
        [1, 2, 3].forEach((n) => {
          returns.push(debouncedFn(n));
        });
      };

      pusher();
      setTimeout(pusher, 1000); // cached
      setTimeout(pusher, 2000); // cached
      setTimeout(pusher, 3500); // not cached
      setTimeout(() => {
        expect(returns).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
        expect(stack).toEqual([2, 4, 6, 2, 4, 6]);
        done();
      }, 4500);
    }));
});
