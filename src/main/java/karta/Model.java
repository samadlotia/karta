package karta;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class Model {
  final Connection connection;

  final PreparedStatement listStacksStatement;
  final PreparedStatement newStackStatement;
  final PreparedStatement getStackStatement;
  final PreparedStatement updateStackStatement;

  final PreparedStatement listDecksStatement;
  final PreparedStatement newDeckStatement;
  final PreparedStatement getDeckStatement;
  final PreparedStatement updateDeckStatement;

  final PreparedStatement listCardsStatement;
  final PreparedStatement newCardStatement;
  final PreparedStatement updateCardStatement;
  final PreparedStatement deleteCardStatement;

  public Model() throws SQLException {
    final String host = System.getProperty("DatabaseHost");
    final String db = System.getProperty("DatabaseName");
    final String username = System.getProperty("DatabaseUsername");
    final String password = System.getProperty("DatabasePassword");
    final String url = String.format("jdbc:postgresql://%s/%s", host, db);

    final Properties props = new Properties();
    if (username != null) {
      props.setProperty("user", username);
    }
    if (password != null) {
      props.setProperty("password", password);
    }

    connection = DriverManager.getConnection(url, props);

    newStackStatement = connection.prepareStatement("INSERT INTO Stack (key, name) VALUES (DEFAULT, ?) RETURNING *;");
    listStacksStatement = connection.prepareStatement("SELECT * FROM Stack;");
    getStackStatement = connection.prepareStatement("SELECT * FROM Stack WHERE key = ?;");
    updateStackStatement = connection.prepareStatement("UPDATE Stack SET name = ? WHERE key = ? RETURNING *;");

    newDeckStatement = connection.prepareStatement("INSERT INTO Deck (key, stack, name) VALUES (DEFAULT, ?, ?) RETURNING *;");
    listDecksStatement = connection.prepareStatement("SELECT * FROM Deck WHERE stack = ?;");
    getDeckStatement = connection.prepareStatement("SELECT * FROM Deck WHERE key = ?;");
    updateDeckStatement = connection.prepareStatement("UPDATE Deck SET stack = ?, name = ? WHERE key = ? RETURNING *;");

    newCardStatement = connection.prepareStatement("INSERT INTO Card (key, deck, front, back, score) VALUES (DEFAULT, ?, ?, ?, ?) RETURNING *;");
    listCardsStatement = connection.prepareStatement("SELECT * FROM Card WHERE deck = ?;");
    updateCardStatement = connection.prepareStatement("UPDATE Card SET front = ?, back = ?, score = ? WHERE key = ? RETURNING *;");
    deleteCardStatement = connection.prepareStatement("DELETE FROM Card WHERE key = ?;");
  }

  public Stack newStack(final String name) throws SQLException {
    newStackStatement.setString(1, name);
    final ResultSet result = newStackStatement.executeQuery();
    result.next();
    return Stack.fromResultSet(result);
  }

  public List<Stack> listStacks() throws SQLException {
    final ResultSet result = listStacksStatement.executeQuery();
    final List<Stack> stacks = new ArrayList<Stack>();
    while (result.next()) {
      stacks.add(Stack.fromResultSet(result));
    }
    return stacks;
  }

  public Stack getStack(final Integer key) throws SQLException {
    getStackStatement.setInt(1, key);
    final ResultSet result = getStackStatement.executeQuery();
    result.next();
    return Stack.fromResultSet(result);
  }

  public Stack updateStack(final Stack stack) throws SQLException {
    updateStackStatement.setString(1, stack.name);
    updateStackStatement.setInt(2, stack.key);
    final ResultSet result = updateStackStatement.executeQuery();
    result.next();
    return Stack.fromResultSet(result);
  }

  public Deck newDeck(final Integer stack, final String name) throws SQLException {
    newDeckStatement.setInt(1, stack);
    newDeckStatement.setString(2, name);
    final ResultSet result = newDeckStatement.executeQuery();
    result.next();
    return Deck.fromResultSet(result);
  }

  public List<Deck> listDecks(final Integer stack) throws SQLException {
    listDecksStatement.setInt(1, stack);
    final ResultSet result = listDecksStatement.executeQuery();
    final List<Deck> decks = new ArrayList<Deck>();
    while (result.next()) {
      decks.add(Deck.fromResultSet(result));
    }
    return decks;
  }

  public Deck getDeck(final Integer key) throws SQLException {
    getDeckStatement.setInt(1, key);
    final ResultSet result = getDeckStatement.executeQuery();
    result.next();
    return Deck.fromResultSet(result);
  }

  public Deck updateDeck(final Deck deck) throws SQLException {
    updateDeckStatement.setInt(1, deck.stack);
    updateDeckStatement.setString(2, deck.name);
    updateDeckStatement.setInt(3, deck.key);
    final ResultSet result = updateDeckStatement.executeQuery();
    result.next();
    return Deck.fromResultSet(result);
  }

  public Card newCard(final Integer deck, final String front, final String back, final Integer score) throws SQLException {
    newCardStatement.setInt(1, deck);
    newCardStatement.setString(2, front);
    newCardStatement.setString(3, back);
    newCardStatement.setInt(4, score);
    final ResultSet result = newCardStatement.executeQuery();
    result.next();
    return Card.fromResultSet(result);
  }

  public List<Card> listCards(final Integer deck) throws SQLException {
    listCardsStatement.setInt(1, deck);
    final ResultSet result = listCardsStatement.executeQuery();
    final List<Card> cards = new ArrayList<Card>();
    while (result.next()) {
      cards.add(Card.fromResultSet(result));
    }
    return cards;
  }

  public Card updateCard(final Card card) throws SQLException {
    updateCardStatement.setString(1, card.front);
    updateCardStatement.setString(2, card.back);
    updateCardStatement.setInt(3, card.score);
    updateCardStatement.setInt(4, card.key);
    final ResultSet result = updateCardStatement.executeQuery();
    result.next();
    return Card.fromResultSet(result);
  }

  public void deleteCard(final Integer key) throws SQLException {
    deleteCardStatement.setInt(1, key);
    deleteCardStatement.execute();
  }

  private static void dumpResultSet(final ResultSet rs) throws SQLException {
    final ResultSetMetaData md = rs.getMetaData();
    final int ncols = md.getColumnCount();
    while (rs.next()) {
      for (int i = 1; i <= ncols; i++) {
        System.out.println(String.format("%d: %s: %s", i, md.getColumnName(i), rs.getString(i)));
      }
    }
  }
}

class Stack {
  final public Integer key;
  final public String name;

  public Stack(Integer key, String name) {
    this.key = key;
    this.name = name;
  }

  public static Stack fromResultSet(final ResultSet result) throws SQLException {
    return new Stack(result.getInt(1), result.getString(2));
  }
}

class Deck {
  final public Integer key;
  final public Integer stack;
  final public String name;

  public Deck(Integer key, Integer stack, String name) {
    this.key = key;
    this.stack = stack;
    this.name = name;
  }

  public static Deck fromResultSet(final ResultSet result) throws SQLException {
    return new Deck(result.getInt(1), result.getInt(2), result.getString(3));
  }
}

class Card {
  final public Integer key;
  final public Integer deck;
  final public String front;
  final public String back;
  final public Integer score;

  public Card(Integer key, Integer deck, String front, String back, Integer score) {
    this.key = key;
    this.deck = deck;
    this.front = front;
    this.back = back;
    this.score = score;
  }

  public static Card fromResultSet(final ResultSet result) throws SQLException {
    return new Card(result.getInt(1), result.getInt(2), result.getString(3), result.getString(4), result.getInt(5));
  }
}
