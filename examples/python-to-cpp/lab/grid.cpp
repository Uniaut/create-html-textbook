#include <iostream>
#include <string>
#include <vector>

int shortest_path(const std::vector<std::string>& grid) {
    // TODO(user): BFS from the top-left to the bottom-right cell.
    // Return the number of moves, or -1 if unreachable.
    (void)grid;
    return -1;
}

int main() {
    int rows, cols;
    if (!(std::cin >> rows >> cols)) {
        return 1;
    }
    std::vector<std::string> grid(rows);
    for (auto& row : grid) {
        std::cin >> row;
    }
    std::cout << shortest_path(grid) << '\n';
}
