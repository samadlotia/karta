package karta;

import com.google.gson.Gson;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;
import spark.Spark;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.ExceptionHandler;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import com.google.common.io.Files;
import com.google.common.base.Charsets;

public class Main {
  public static void main(String[] args) throws Exception {
    final Model model = new Model();
    final Gson gson = new Gson();
    final JsonParser parser = new JsonParser();

    if (true) {
      Spark.externalStaticFileLocation("/Users/samadlotia/src/karta/src/main/resources/static");
    } else {
      Spark.staticFileLocation("/static");
    }

    Spark.get("/", new Route() {
      public Object handle(final Request req, final Response resp) throws IOException, URISyntaxException {
        return Files.toString(new File(getClass().getResource("/static/index.html").toURI()), Charsets.UTF_8);
      }
    });

    Spark.exception(Exception.class, new ExceptionHandler() {
      public void handle(final Exception e, final Request req, final Response resp) {
        e.printStackTrace();
        resp.status(500);
      }
    });

    Spark.get("/_/stack", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        return gson.toJson(model.listStacks());
      }
    });

    Spark.get("/_/stack/:key", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer key = Integer.parseInt(req.params(":key"));
        return gson.toJson(model.getStack(key));
      }
    });

    Spark.post("/_/stack", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final JsonElement content = parser.parse(req.body());
        final String name = content.getAsJsonObject().get("name").getAsString();
        return gson.toJson(model.newStack(name));
      }
    });

    Spark.put("/_/stack", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer key = Integer.parseInt(req.queryParams("key"));
        final String name = req.queryParams("name");
        return gson.toJson(model.updateStack(new Stack(key, name)));
      }
    });

    Spark.get("/_/deck", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer stack = Integer.parseInt(req.queryParams("stack"));
        return gson.toJson(model.listDecks(stack));
      }
    });

    Spark.get("/_/deck/:key", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer key = Integer.parseInt(req.params(":key"));
        return gson.toJson(model.getDeck(key));
      }
    });

    Spark.post("/_/deck", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final JsonElement content = parser.parse(req.body());
        final Integer stack = Integer.parseInt(content.getAsJsonObject().get("stack").getAsString());
        final String name = content.getAsJsonObject().get("name").getAsString();
        return gson.toJson(model.newDeck(stack, name));
      }
    });

    Spark.put("/_/deck", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer key = Integer.parseInt(req.queryParams("key"));
        final Integer stack = Integer.parseInt(req.queryParams("stack"));
        final String name = req.queryParams("name");
        return gson.toJson(model.updateDeck(new Deck(key, stack, name)));
      }
    });

    Spark.get("/_/card", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final Integer deck = Integer.parseInt(req.queryParams("deck"));
        return gson.toJson(model.listCards(deck));
      }
    });

    Spark.post("/_/card", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final JsonElement content = parser.parse(req.body());
        final Integer deck = Integer.parseInt(content.getAsJsonObject().get("deck").getAsString());
        final String front = content.getAsJsonObject().get("front").getAsString();
        final String back = content.getAsJsonObject().get("back").getAsString();
        final Integer score = Integer.parseInt(content.getAsJsonObject().get("score").getAsString());
        return gson.toJson(model.newCard(deck, front, back, score));
      }
    });

    Spark.put("/_/card", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final JsonElement content = parser.parse(req.body());
        final Integer key = Integer.parseInt(content.getAsJsonObject().get("key").getAsString());
        final Integer deck = Integer.parseInt(content.getAsJsonObject().get("deck").getAsString());
        final String front = content.getAsJsonObject().get("front").getAsString();
        final String back = content.getAsJsonObject().get("back").getAsString();
        final Integer score = Integer.parseInt(content.getAsJsonObject().get("score").getAsString());
        return gson.toJson(model.updateCard(new Card(key, deck, front, back, score)));
      }
    });

    Spark.delete("/_/card", new Route() {
      public Object handle(final Request req, final Response resp) throws SQLException {
        final JsonElement content = parser.parse(req.body());
        final Integer key = Integer.parseInt(content.getAsJsonObject().get("key").getAsString());
        model.deleteCard(key);
        return "true";
      }
    });
  }
}
