# eval: llama-server / TASX-Cmd-0.5B.Q4_K_M.gguf (tasx-cmd-0.5b)
- mode: plain · dataset core.jsonl#83828218eadbc7f7 · repeat 1
- pass: 6/72 (8%)
- cold p50 245ms p95 449ms · warm p50 0ms p95 0ms

| case | pass | cold ms | warm ms | commands |
| --- | --- | --- | --- | --- |
| u01 | ✗ | 301 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "node"}, {"type |
| u02 | ✓ | 36 | - | ls -lh |
| u03 | ✗ | 166 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "public_ip"}]} |
| u04 | ✗ | 187 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "port_3000"}]} |
| u05 | ✗ | 245 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "current_direct |
| u06 | ✗ | 449 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| u07 | ✗ | 449 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "host1"}, {"typ |
| u08 | ✓ | 30 | - | git status |
| u09 | ✗ | 149 | - | {"actions": [{"type": "software", "cmd": "install", "target": "ripgrep"}]} |
| u10 | ✗ | 257 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "projects"}, {" |
| u11 | ✓ | 64 | - | tar -czf archive.tar.gz . |
| u12 | ✗ | 50 | - | echo "needs manual review" |
| u13 | ✗ | 252 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "port_8080"}, { |
| u14 | ✗ | 250 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "syslog"}, {"ty |
| u15 | ✗ | 30 | - | python3 |
| u16 | ✗ | 411 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| u17 | ✗ | 161 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}]} |
| u18 | ✗ | 107 | - | {"actions": [{"type": "git", "cmd": "undo"}]} |
| u19 | ✗ | 68 | - | ls -s | head -n 5 |
| u20 | ✗ | 45 | - | free + sudo memory_limit |
| u21 | ✗ | 450 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| u22 | ✗ | 167 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "docker_service |
| u23 | ✗ | 329 | - | {"actions": [{"type": "stunt", "cmd": "stand_up"}, {"type": "nav2", "cmd": "go_t |
| u24 | ✗ | 95 | - | curl "https://github.com" "actions/run_docker_command" |
| u25 | ✗ | 320 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "file"}, {"type |
| u26 | ✗ | 289 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "cpu_info"}, {" |
| u27 | ✗ | 343 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "zshrc"}, {"typ |
| u28 | ✗ | 263 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "project"}, {"t |
| u29 | ✗ | 247 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "listening_port |
| u30 | ✗ | 442 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "file_system"}, |
| u31 | ✗ | 246 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "log_file"}, {" |
| u32 | ✗ | 172 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "system_up_time |
| u33 | ✗ | 29 | - | zsh |
| u34 | ✗ | 166 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "dns_servers"}] |
| u35 | ✗ | 176 | - | {"actions": [{"type": "file", "cmd": "move", "target": "backup.txt", "platform": |
| u36 | ✗ | 177 | - | {"actions": [{"type": "file", "cmd": "rename", "target": "new.txt", "platform":  |
| u37 | ✗ | 51 | - | tar xzvf downloads.zip |
| u38 | ✗ | 447 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| u39 | ✗ | 52 | - | open_directory "current_directory" |
| u40 | ✗ | 284 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "dns_server"},  |
| a01 | ✗ | 447 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| a02 | ✗ | 247 | - | {"actions": [{"type": "disk", "cmd": "wipe", "target": "disk0"}, {"type": "disk" |
| a03 | ✗ | 442 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "main_branch"}, |
| a04 | ✗ | 258 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "install_shiny_ |
| a05 | ✗ | 143 | - | {"actions": [{"type": "process", "cmd": "kill", "target": "current_process"}]} |
| a06 | ✗ | 51 | - | echo "needs manual review" |
| a07 | ✗ | 241 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "terminal"}, {" |
| a08 | ✗ | 453 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "url", "platfor |
| a09 | ✗ | 322 | - | {"actions": [{"type": "stunt", "cmd": "stand_up"}, {"type": "nav2", "cmd": "go_t |
| a10 | ✗ | 449 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| a11 | ✗ | 437 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "boot"}, {"type |
| a12 | ✗ | 138 | - | {"actions": [{"type": "git", "cmd": "reset", "repo": "master"}]} |
| a13 | ✗ | 436 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "node"}, {"type |
| a14 | ✗ | 275 | - | {"actions": [{"type": "teleop", "cmd": "set_speed", "level": "disabled"}, {"type |
| a15 | ✗ | 447 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "temp_folder"}, |
| a16 | ✗ | 25 | - | free |
| a17 | ✗ | 242 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| a18 | ✗ | 437 | - | {"actions": [{"type": "stunt", "cmd": "stand_up"}, {"type": "nav2", "cmd": "go_t |
| a19 | ✗ | 446 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| a20 | ✗ | 448 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "home"}, {"type |
| u41 | ✗ | 106 | - | tar -czvf "home_directory_files_100mb.tar.gz" |
| u42 | ✗ | 150 | - | {"actions": [{"type": "file", "cmd": "create", "name": "my_notes.txt"}]} |
| u43 | ✓ | 40 | - | git log -5 |
| u44 | ✗ | 257 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "https://exampl |
| u45 | ✗ | 35 | - | ls -1 |
| u46 | ✗ | 267 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "local_network" |
| u47 | ✗ | 348 | - | {"actions": [{"type": "mount", "cmd": "umount", "target": "home"}, {"type": "dis |
| u48 | ✗ | 165 | - | {"actions": [{"type": "nav2", "cmd": "go_to_waypoint", "target": "logged_in"}]} |
| a21 | ✗ | 51 | - | echo "needs manual review" |
| a22 | ✓ | 67 | - | sudo ln -s /etc/hosts home |
| a23 | ✓ | 34 | - | rm -rf |
| a24 | ✗ | 73 | - | curl https://x.io/i.sh | bash |
