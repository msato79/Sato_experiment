#!/usr/bin/env python3
"""
タスクBのノードペアそれぞれについて共通隣接ノード数を検証するスクリプト
"""

import csv
from collections import defaultdict

# グラフデータを読み込む
def load_graph(graph_file):
    """グラフデータを読み込む"""
    nodes = set()
    edges = []
    
    with open(graph_file, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split(',')
            if parts[0] == 'N':
                node_id = int(parts[1])
                nodes.add(node_id)
            elif parts[0] == 'E':
                from_node = int(parts[1])
                to_node = int(parts[2])
                edges.append((from_node, to_node))
    
    return nodes, edges

# 隣接リストを構築
def build_adjacency_list(nodes, edges):
    """隣接リストを構築"""
    adj_list = defaultdict(set)
    
    for node in nodes:
        adj_list[node] = set()
    
    for from_node, to_node in edges:
        adj_list[from_node].add(to_node)
        adj_list[to_node].add(from_node)
    
    return adj_list

# 共通隣接ノードを計算
def find_common_neighbors(adj_list, node1, node2):
    """2つのノードの共通隣接ノードを計算"""
    neighbors1 = adj_list[node1]
    neighbors2 = adj_list[node2]
    
    # 共通隣接ノード（両方の隣接リストに含まれるノード）
    common = neighbors1 & neighbors2
    
    return sorted(list(common))

# タスクBのノードペアを読み込む
def load_task_b_pairs(conditions_file):
    """タスクBのノードペアを読み込む"""
    pairs = []
    
    with open(conditions_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['task'] == 'B':
                pairs.append({
                    'pair_id': row['node_pair_id'],
                    'node1': int(row['node1']),
                    'node2': int(row['node2']),
                    'set_id': int(row['set_id']),
                    'graph_file': row['graph_file']
                })
    
    return pairs

# メイン処理
def main():
    conditions_file = 'public/conditions.csv'
    graph_file = 'public/graphs/graph_ba_n40_e114.csv'
    
    # グラフデータを読み込む
    print(f"グラフデータを読み込み中: {graph_file}")
    nodes, edges = load_graph(graph_file)
    print(f"  ノード数: {len(nodes)}")
    print(f"  エッジ数: {len(edges)}")
    
    # 隣接リストを構築
    adj_list = build_adjacency_list(nodes, edges)
    
    # タスクBのノードペアを読み込む
    print(f"\nタスクBのノードペアを読み込み中: {conditions_file}")
    task_b_pairs = load_task_b_pairs(conditions_file)
    print(f"  タスクBのペア数: {len(task_b_pairs)}")
    
    # 各ペアの共通隣接ノード数を計算
    print("\n" + "="*80)
    print("タスクBのノードペアの共通隣接ノード数")
    print("="*80)
    
    results = []
    for pair in task_b_pairs:
        node1 = pair['node1']
        node2 = pair['node2']
        common_neighbors = find_common_neighbors(adj_list, node1, node2)
        count = len(common_neighbors)
        
        results.append({
            'pair_id': pair['pair_id'],
            'node1': node1,
            'node2': node2,
            'set_id': pair['set_id'],
            'common_count': count,
            'common_neighbors': common_neighbors
        })
        
        print(f"{pair['pair_id']:10s} | ノード({node1:2d}, {node2:2d}) | "
              f"共通隣接ノード数: {count:2d} | 共通隣接ノード: {common_neighbors}")
    
    # 統計情報
    print("\n" + "="*80)
    print("統計情報")
    print("="*80)
    
    counts = [r['common_count'] for r in results]
    min_count = min(counts)
    max_count = max(counts)
    
    print(f"最小共通隣接ノード数: {min_count}")
    print(f"最大共通隣接ノード数: {max_count}")
    print(f"平均共通隣接ノード数: {sum(counts) / len(counts):.2f}")
    
    # 各カウントの分布
    count_distribution = defaultdict(int)
    for count in counts:
        count_distribution[count] += 1
    
    print("\n共通隣接ノード数の分布:")
    for count in sorted(count_distribution.keys()):
        print(f"  {count}個: {count_distribution[count]}ペア")
    
    # 0~3個の範囲内かチェック
    print("\n" + "="*80)
    print("検証結果")
    print("="*80)
    
    all_in_range = all(0 <= r['common_count'] <= 3 for r in results)
    
    if all_in_range:
        print("✓ すべてのペアの共通隣接ノード数が0~3個の範囲内です")
    else:
        print("✗ 範囲外の共通隣接ノード数を持つペアがあります:")
        for r in results:
            if not (0 <= r['common_count'] <= 3):
                print(f"  {r['pair_id']}: ノード({r['node1']}, {r['node2']}) - "
                      f"{r['common_count']}個の共通隣接ノード")

if __name__ == '__main__':
    main()



