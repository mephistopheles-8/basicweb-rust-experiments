{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app-tasks = callPackage ./default.nix {};
in pkgs.dockerTools.buildImage {
  name = "basicweb-app-tasks";
  tag = "latest";
  created = "now";
  contents = [ app-tasks ];
  config = {
    Cmd = [ "/bin/app-tasks" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
    ];
  };
}
