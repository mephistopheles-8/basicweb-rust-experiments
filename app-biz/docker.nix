{ pkgs ? import <nixpkgs> {} }:
with pkgs;
let
  app-biz = callPackage ./default.nix {};
in pkgs.dockerTools.buildImage {
  name = "basicweb-app-biz";
  tag = "latest";
  created = "now";
  contents = [ app-biz ];
  config = {
    Cmd = [ "/bin/app-biz" ];
    WorkingDir = "/";
    Env = [
      "DATABASE_URL=/data/database.sqlite"
      "STATIC_DIR=/static"
    ];
  };
}
